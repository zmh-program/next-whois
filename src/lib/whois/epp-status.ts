export type EppStatusCategory =
  | "ok"
  | "client"
  | "server"
  | "pending"
  | "grace"
  | "redemption";

export type EppStatusInfo = {
  description: string;
  category: EppStatusCategory;
  displayName: string;
};

const categoryColors: Record<EppStatusCategory, string> = {
  ok: "#10b981",
  client: "#3b82f6",
  server: "#8b5cf6",
  pending: "#f59e0b",
  grace: "#0ea5e9",
  redemption: "#ef4444",
};

const categoryLabels: Record<EppStatusCategory, string> = {
  ok: "Active",
  client: "Client Lock",
  server: "Server Lock",
  pending: "Pending",
  grace: "Grace Period",
  redemption: "Redemption",
};

const EPP_STATUS_MAP: Record<string, EppStatusInfo> = {
  ok: {
    displayName: "ok",
    description: "This is the standard status for a domain, meaning no pending operations or prohibitions.",
    category: "ok",
  },
  active: {
    displayName: "active",
    description: "The domain is active and delegated in the DNS.",
    category: "ok",
  },
  inactive: {
    displayName: "inactive",
    description: "The domain has not been delegated in the DNS and will not resolve.",
    category: "redemption",
  },
  addperiod: {
    displayName: "addPeriod",
    description: "Initial registration grace period. The domain can be deleted for a refund within a few days of registration.",
    category: "grace",
  },
  autorenewperiod: {
    displayName: "autoRenewPeriod",
    description: "Auto-renewal grace period after automatic renewal. Registrar may delete registration for a refund.",
    category: "grace",
  },
  renewperiod: {
    displayName: "renewPeriod",
    description: "Renewal grace period. The registrar may delete the registration for a refund.",
    category: "grace",
  },
  transferperiod: {
    displayName: "transferPeriod",
    description: "Transfer grace period after a successful transfer. The new registrar may delete for a refund.",
    category: "grace",
  },
  clientdeleteprohibited: {
    displayName: "clientDeleteProhibited",
    description: "The registrar has set this status to prevent the domain from being deleted.",
    category: "client",
  },
  clienthold: {
    displayName: "clientHold",
    description: "The registrar has suspended the domain. It will not resolve in the DNS.",
    category: "client",
  },
  clientrenewprohibited: {
    displayName: "clientRenewProhibited",
    description: "The registrar has locked the domain to prevent renewal.",
    category: "client",
  },
  clienttransferprohibited: {
    displayName: "clientTransferProhibited",
    description: "The registrar has locked the domain to prevent transfer to another registrar.",
    category: "client",
  },
  clientupdateprohibited: {
    displayName: "clientUpdateProhibited",
    description: "The registrar has locked the domain to prevent any changes to the domain record.",
    category: "client",
  },
  serverdeleteprohibited: {
    displayName: "serverDeleteProhibited",
    description: "The registry has set this status to prevent the domain from being deleted.",
    category: "server",
  },
  serverhold: {
    displayName: "serverHold",
    description: "The registry has suspended the domain. It will not resolve in the DNS.",
    category: "server",
  },
  serverrenewprohibited: {
    displayName: "serverRenewProhibited",
    description: "The registry has locked the domain to prevent renewal.",
    category: "server",
  },
  servertransferprohibited: {
    displayName: "serverTransferProhibited",
    description: "The registry has locked the domain to prevent transfer.",
    category: "server",
  },
  serverupdateprohibited: {
    displayName: "serverUpdateProhibited",
    description: "The registry has locked the domain to prevent any changes.",
    category: "server",
  },
  pendingcreate: {
    displayName: "pendingCreate",
    description: "A request to create the domain has been received and is being processed.",
    category: "pending",
  },
  pendingdelete: {
    displayName: "pendingDelete",
    description: "The domain is scheduled for deletion. It cannot be restored and will be purged soon.",
    category: "pending",
  },
  pendingrenew: {
    displayName: "pendingRenew",
    description: "A request to renew the domain has been received and is being processed.",
    category: "pending",
  },
  pendingrestore: {
    displayName: "pendingRestore",
    description: "A restore request has been received after redemption period. Pending registry approval.",
    category: "pending",
  },
  pendingtransfer: {
    displayName: "pendingTransfer",
    description: "A transfer request has been received and is pending approval or rejection.",
    category: "pending",
  },
  pendingupdate: {
    displayName: "pendingUpdate",
    description: "A request to update the domain has been received and is being processed.",
    category: "pending",
  },
  redemptionperiod: {
    displayName: "redemptionPeriod",
    description: "The domain has been deleted but can still be restored by the registrar for an additional fee.",
    category: "redemption",
  },
};

export function getEppStatusInfo(status: string): EppStatusInfo | null {
  const normalized = status.toLowerCase().replace(/[\s_-]/g, "");
  return EPP_STATUS_MAP[normalized] || null;
}

export function getEppStatusColor(status: string): string {
  const info = getEppStatusInfo(status);
  if (!info) return "#71717a";
  return categoryColors[info.category];
}

export function getEppStatusDisplayName(status: string): string {
  const info = getEppStatusInfo(status);
  if (!info) return status;
  return info.displayName;
}

export function getEppStatusLink(status: string): string {
  const info = getEppStatusInfo(status);
  if (!info) return "https://icann.org/epp";
  return `https://icann.org/epp#${info.displayName}`;
}

export function getEppStatusLabel(status: string): string {
  const info = getEppStatusInfo(status);
  if (!info) return "Unknown";
  return categoryLabels[info.category];
}

export { categoryColors, categoryLabels };
