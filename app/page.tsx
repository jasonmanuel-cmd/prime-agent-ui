"use client";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Scan, Send, FileText, BarChart3, Settings, Activity, Trash2 } from "lucide-react";

type Tab = "scan" | "sms" | "invoices" | "analytics" | "settings";

interface Lead {
  lead_id: string;
  company_name: string;
  platform: string;
  phone: string;
  email: string;
  hot_lead_score: number;
  status: string;
  created_at: string;
}

interface HealthStatus {
  api_server: boolean;
  sms_provider: boolean;
  paypal: boolean;
  database: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8082";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("scan");
  const [industry, setIndustry] = useState("plumbing");
  const [location, setLocation] = useState("Phoenix AZ");
  const [scanResults, setScanResults] = useState<Lead[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [invoiceData, setInvoiceData] = useState({ company: "", amount: "", desc: "", email: "" });

  const tabs = [
    { id: "scan" as Tab, label: "Lead Scanner", icon: Scan },
    { id: "sms" as Tab, label: "SMS Outreach", icon: Send },
    { id: "invoices" as Tab, label: "Invoices", icon: FileText },
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      setHealth({
        api_server: true,
        sms_provider: true,
        paypal: true,
        database: data.database === "connected",
      });
    } catch {
      setHealth({ api_server: false, sms_provider: false, paypal: false, database: false });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE}/web/scan-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, location, limit: 10 }),
      });
      const data = await res.json();
      setScanResults(data.leads || []);
    } catch (err) {
      setScanResults([{ lead_id: "err", company_name: "Scan failed", platform: "N/A", phone: "", email: "", hot_lead_score: 0, status: "error", created_at: "" }]);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSmsSend = async () => {
    if (!smsPhone || !smsMessage) return;
    try {
      const res = await fetch(`${API_BASE}/web/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: smsPhone, message: smsMessage }),
      });
      const data = await res.json();
      alert(data.success ? "SMS sent!" : `Failed: ${data.error || "Unknown error"}`);
    } catch (err) {
      alert("Failed to send SMS");
    }
  };

  const handleInvoice = async () => {
    if (!invoiceData.company || !invoiceData.amount) return;
    try {
      const res = await fetch(`${API_BASE}/web/paypal/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: invoiceData.company,
          amount: parseFloat(invoiceData.amount),
          description: invoiceData.desc || "COAI Service",
          emails: invoiceData.email ? [invoiceData.email] : [],
        }),
      });
      const data = await res.json();
      if (data.success && data.invoice_url) {
        window.open(data.invoice_url, "_blank");
      } else if (data.paypal_url) {
        window.open(data.paypal_url, "_blank");
      } else {
        alert("Invoice creation failed — check API server");
      }
    } catch {
      alert("Failed to create invoice");
    }
  };

  const clearResults = () => {
    setScanResults([]);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "scan":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Industry (e.g., plumbing)"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Location (e.g., Phoenix AZ)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isScanning ? "Scanning..." : <><Scan size={16} /> Scan</>}
              </button>
            </div>
            {scanResults.length > 0 && (
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{scanResults.length} leads found</h3>
                <button
                  onClick={clearResults}
                  className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <Trash2 size={14} /> Clear
                </button>
              </div>
            )}
            {scanResults.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Company</th>
                      <th className="p-2 text-left">Platform</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Score</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResults.map((lead) => (
                      <tr key={lead.lead_id} className={lead.hot_lead_score >= 80 ? "bg-red-50" : lead.hot_lead_score >= 50 ? "bg-yellow-50" : ""}>
                        <td className="p-2">{lead.company_name}</td>
                        <td className="p-2">{lead.platform || "N/A"}</td>
                        <td className="p-2">{lead.phone || "N/A"}</td>
                        <td className="p-2">{lead.email || "N/A"}</td>
                        <td className="p-2">{lead.hot_lead_score}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${lead.hot_lead_score >= 80 ? "bg-red-100 text-red-800" : lead.hot_lead_score >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}`}>
                            {lead.hot_lead_score >= 80 ? "Hot" : lead.hot_lead_score >= 50 ? "Warm" : "Cold"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      case "sms":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="SMS message..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <button
                onClick={handleSmsSend}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Send size={16} /> Send SMS
              </button>
            </div>
          </div>
        );
      case "invoices":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Company name"
                value={invoiceData.company}
                onChange={(e) => setInvoiceData({...invoiceData, company: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Amount ($)"
                value={invoiceData.amount}
                onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={invoiceData.desc}
                onChange={(e) => setInvoiceData({...invoiceData, desc: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                defaultValue="COAI Website Design Service"
              />
              <input
                type="email"
                placeholder="Client email"
                value={invoiceData.email}
                onChange={(e) => setInvoiceData({...invoiceData, email: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
              />
              <button
                onClick={handleInvoice}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 col-span-2"
              >
                <FileText size={16} /> Create PayPal Invoice
              </button>
            </div>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lead Analytics</h3>
            {scanResults.length > 0 ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold">{scanResults.length}</div>
                  <div className="text-sm text-gray-600">Total Leads</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold">{scanResults.filter(l => l.hot_lead_score >= 80).length}</div>
                  <div className="text-sm text-gray-600">Hot Leads</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold">{scanResults.filter(l => l.status === "contacted").length}</div>
                  <div className="text-sm text-gray-600">Contacted</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Scan for leads to see analytics</p>
            )}
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">System Status</h3>
              {health ? (
                <div className="space-y-2">
                  <StatusItem label="API Server" ok={health.api_server} />
                  <StatusItem label="SMS Provider (Telnyx)" ok={health.sms_provider} />
                  <StatusItem label="PayPal (Production)" ok={health.paypal} />
                  <StatusItem label="Database (Neon)" ok={health.database} />
                </div>
              ) : (
                <p className="text-gray-500">Checking status...</p>
              )}
              <button
                onClick={checkHealth}
                className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                Refresh
              </button>
            </div>
            <div>
              <p className="text-xs text-gray-400">API base: {API_BASE}</p>
            </div>
          </div>
        );
    }
  };

  const StatusItem = ({ label, ok }: { label: string; ok: boolean }) => (
    <div className="flex justify-between items-center p-2 border rounded">
      <span>{label}</span>
      <span className={ok ? "text-green-600" : "text-red-600"}>
        {ok ? "Online" : "Offline"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg">COAI Lead Engine</span>
            </div>
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 capitalize">{tabs.find(t => t.id === activeTab)?.label}</h2>
          {renderTabContent()}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
