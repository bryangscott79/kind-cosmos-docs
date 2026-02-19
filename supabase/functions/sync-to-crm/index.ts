import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ────────────────────────────────────────────
//  HubSpot integration
// ────────────────────────────────────────────

async function hubspotCreateCompany(
  apiKey: string,
  prospect: any
): Promise<{ id: string; url: string }> {
  const body = {
    properties: {
      name: prospect.companyName,
      city: prospect.location?.city || "",
      state: prospect.location?.state || "",
      country: prospect.location?.country || "US",
      annualrevenue: prospect.annualRevenue?.replace(/[^0-9]/g, "") || "",
      numberofemployees: prospect.employeeCount?.toString() || "",
      industry: prospect.industryName || "",
      description: prospect.whyNow || "",
    },
  };

  const res = await fetch("https://api.hubapi.com/crm/v3/objects/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HubSpot Company: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    url: `https://app.hubspot.com/contacts/${data.properties?.hs_object_id || data.id}/company/${data.id}`,
  };
}

async function hubspotCreateContact(
  apiKey: string,
  contact: any,
  companyId?: string
): Promise<{ id: string }> {
  const nameParts = (contact.name || "").split(" ");
  const body = {
    properties: {
      firstname: nameParts[0] || "",
      lastname: nameParts.slice(1).join(" ") || "",
      jobtitle: contact.title || "",
      email: contact.email || "",
      company: contact.companyName || "",
    },
  };

  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    // 409 = contact exists, that's OK
    if (res.status === 409) {
      const conflict = JSON.parse(err);
      return { id: conflict?.message?.match(/ID: (\d+)/)?.[1] || "existing" };
    }
    throw new Error(`HubSpot Contact: ${res.status} — ${err}`);
  }

  const data = await res.json();

  // Associate contact with company
  if (companyId && data.id) {
    try {
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${data.id}/associations/companies/${companyId}/contact_to_company`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
    } catch {}
  }

  return { id: data.id };
}

async function hubspotCreateDeal(
  apiKey: string,
  prospect: any,
  companyId?: string,
  stageMapping?: Record<string, string>
): Promise<{ id: string; url: string }> {
  const defaultStages: Record<string, string> = {
    researching: "appointmentscheduled",
    contacted: "qualifiedtobuy",
    meeting_scheduled: "presentationscheduled",
    proposal_sent: "decisionmakerboughtin",
    won: "closedwon",
    lost: "closedlost",
  };

  const stages = { ...defaultStages, ...stageMapping };

  const body = {
    properties: {
      dealname: `${prospect.companyName} — VIGYL Lead`,
      dealstage: stages[prospect.pipelineStage] || "appointmentscheduled",
      pipeline: "default",
      amount: prospect.annualRevenue?.replace(/[^0-9]/g, "") || "",
      description: [
        `VIGYL Score: ${prospect.vigylScore}/100`,
        `Status: ${prospect.pressureLabel || prospect.pressureResponse}`,
        `Why Now: ${prospect.whyNow}`,
        prospect.notes ? `Notes: ${prospect.notes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  };

  const res = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HubSpot Deal: ${res.status} — ${err}`);
  }

  const data = await res.json();

  // Associate deal with company
  if (companyId && data.id) {
    try {
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/deals/${data.id}/associations/companies/${companyId}/deal_to_company`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
    } catch {}
  }

  return {
    id: data.id,
    url: `https://app.hubspot.com/contacts/${data.properties?.hs_object_id || data.id}/deal/${data.id}`,
  };
}

async function syncToHubSpot(
  apiKey: string,
  prospect: any,
  stageMapping?: Record<string, string>
): Promise<{ companyId?: string; dealId?: string; contactIds?: string[]; dealUrl?: string }> {
  // 1. Create company
  const company = await hubspotCreateCompany(apiKey, prospect);

  // 2. Create contacts
  const contactIds: string[] = [];
  for (const dm of prospect.decisionMakers || []) {
    try {
      const contact = await hubspotCreateContact(
        apiKey,
        { ...dm, companyName: prospect.companyName },
        company.id
      );
      contactIds.push(contact.id);
    } catch (e: any) {
      console.warn(`Contact sync skipped: ${e.message}`);
    }
  }

  // 3. Create deal
  const deal = await hubspotCreateDeal(apiKey, prospect, company.id, stageMapping);

  return {
    companyId: company.id,
    dealId: deal.id,
    contactIds,
    dealUrl: deal.url,
  };
}

// ────────────────────────────────────────────
//  Salesforce integration
// ────────────────────────────────────────────

async function salesforceCreateLead(
  accessToken: string,
  instanceUrl: string,
  prospect: any,
  contact: any
): Promise<{ id: string; url: string }> {
  const nameParts = (contact.name || "").split(" ");
  const body = {
    FirstName: nameParts[0] || "",
    LastName: nameParts.slice(1).join(" ") || contact.name || "Unknown",
    Company: prospect.companyName,
    Title: contact.title || "",
    Email: contact.email || "",
    City: prospect.location?.city || "",
    State: prospect.location?.state || "",
    Country: prospect.location?.country || "US",
    AnnualRevenue: parseInt(prospect.annualRevenue?.replace(/[^0-9]/g, "") || "0") || null,
    NumberOfEmployees: prospect.employeeCount || null,
    Industry: prospect.industryName || "",
    Description: [
      `VIGYL Score: ${prospect.vigylScore}/100`,
      `Why Now: ${prospect.whyNow}`,
      prospect.notes ? `Notes: ${prospect.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    LeadSource: "VIGYL",
  };

  const res = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Lead`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Salesforce Lead: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    url: `${instanceUrl}/lightning/r/Lead/${data.id}/view`,
  };
}

async function salesforceCreateOpportunity(
  accessToken: string,
  instanceUrl: string,
  prospect: any,
  stageMapping?: Record<string, string>
): Promise<{ id: string; url: string }> {
  const defaultStages: Record<string, string> = {
    researching: "Prospecting",
    contacted: "Qualification",
    meeting_scheduled: "Needs Analysis",
    proposal_sent: "Proposal/Price Quote",
    won: "Closed Won",
    lost: "Closed Lost",
  };

  const stages = { ...defaultStages, ...stageMapping };

  // Close date: 90 days from now or today if won/lost
  const closeDate = prospect.pipelineStage === "won" || prospect.pipelineStage === "lost"
    ? new Date().toISOString().split("T")[0]
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const body = {
    Name: `${prospect.companyName} — VIGYL Lead`,
    StageName: stages[prospect.pipelineStage] || "Prospecting",
    CloseDate: closeDate,
    Amount: parseInt(prospect.annualRevenue?.replace(/[^0-9]/g, "") || "0") || null,
    Description: [
      `VIGYL Score: ${prospect.vigylScore}/100`,
      `Status: ${prospect.pressureLabel || prospect.pressureResponse}`,
      `Why Now: ${prospect.whyNow}`,
    ]
      .filter(Boolean)
      .join("\n"),
    LeadSource: "VIGYL",
  };

  const res = await fetch(
    `${instanceUrl}/services/data/v59.0/sobjects/Opportunity`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Salesforce Opportunity: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    url: `${instanceUrl}/lightning/r/Opportunity/${data.id}/view`,
  };
}

async function syncToSalesforce(
  accessToken: string,
  instanceUrl: string,
  prospect: any,
  stageMapping?: Record<string, string>
): Promise<{ leadIds?: string[]; opportunityId?: string; opportunityUrl?: string }> {
  // 1. Create leads for each decision maker
  const leadIds: string[] = [];
  for (const dm of prospect.decisionMakers || []) {
    try {
      const lead = await salesforceCreateLead(accessToken, instanceUrl, prospect, dm);
      leadIds.push(lead.id);
    } catch (e: any) {
      console.warn(`Lead sync skipped: ${e.message}`);
    }
  }

  // If no decision makers, create a placeholder lead
  if (leadIds.length === 0) {
    try {
      const lead = await salesforceCreateLead(accessToken, instanceUrl, prospect, {
        name: "Unknown Contact",
        title: "",
        email: "",
      });
      leadIds.push(lead.id);
    } catch (e: any) {
      console.warn(`Placeholder lead skipped: ${e.message}`);
    }
  }

  // 2. Create opportunity
  const opp = await salesforceCreateOpportunity(accessToken, instanceUrl, prospect, stageMapping);

  return {
    leadIds,
    opportunityId: opp.id,
    opportunityUrl: opp.url,
  };
}

// ────────────────────────────────────────────
//  Main handler
// ────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const { connectionId, prospect } = await req.json();
    if (!connectionId || !prospect) throw new Error("connectionId and prospect required");

    // Get CRM connection
    const { data: connection, error: connErr } = await supabase
      .from("crm_connections")
      .select("*")
      .eq("id", connectionId)
      .eq("user_id", user.id)
      .single();

    if (connErr || !connection) throw new Error("CRM connection not found");
    if (!connection.is_active) throw new Error("CRM connection is not active");

    // Create sync log entry (pending)
    const { data: logEntry } = await supabase
      .from("crm_sync_log")
      .insert({
        user_id: user.id,
        connection_id: connectionId,
        prospect_id: prospect.id || "unknown",
        company_name: prospect.companyName,
        provider: connection.provider,
        action: "create",
        status: "pending",
        payload: prospect,
      })
      .select("id")
      .single();

    const logId = logEntry?.id;

    try {
      let result: any;

      if (connection.provider === "hubspot") {
        result = await syncToHubSpot(
          connection.api_key,
          prospect,
          connection.default_pipeline_mapping || {}
        );
      } else if (connection.provider === "salesforce") {
        if (!connection.instance_url) throw new Error("Salesforce instance URL not configured");
        result = await syncToSalesforce(
          connection.api_key,
          connection.instance_url,
          prospect,
          connection.default_pipeline_mapping || {}
        );
      } else {
        throw new Error(`Unsupported CRM provider: ${connection.provider}`);
      }

      // Determine the main record URL
      const crmRecordUrl = result.dealUrl || result.opportunityUrl || null;
      const crmRecordId = result.dealId || result.opportunityId || result.companyId || null;

      // Update sync log — success
      if (logId) {
        await supabase
          .from("crm_sync_log")
          .update({
            status: "success",
            crm_record_id: crmRecordId,
            crm_record_url: crmRecordUrl,
          })
          .eq("id", logId);
      }

      // Update connection last_synced_at
      await supabase
        .from("crm_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", connectionId);

      return new Response(
        JSON.stringify({
          success: true,
          provider: connection.provider,
          ...result,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (syncError: any) {
      // Update sync log — failed
      if (logId) {
        await supabase
          .from("crm_sync_log")
          .update({
            status: "failed",
            error_message: syncError.message,
          })
          .eq("id", logId);
      }
      throw syncError;
    }
  } catch (e: any) {
    console.error("CRM sync error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
