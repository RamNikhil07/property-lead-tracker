"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Property = {
	id: number;
	title: string;
};

type Agent = {
	id: number;
	name: string;
};

type Lead = {
	id: number;
	customer_name: string;
	phone: string;
	property_id: number;
	agent_id: number;
	status: string;
	created_at: string;
};

type LeadForm = {
	customer_name: string;
	phone: string;
	property_id: string;
	agent_id: string;
	status: string;
};

const API_URL = "http://127.0.0.1:8000/api";
const statuses = ["New", "Contacted", "Qualified", "Converted"];

function errorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en-IN", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export default function LeadsPage() {
	const [properties, setProperties] = useState<Property[]>([]);
	const [agents, setAgents] = useState<Agent[]>([]);
	const [leads, setLeads] = useState<Lead[]>([]);
	const [statusFilter, setStatusFilter] = useState("");
	const [textSearch, setTextSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [updatingId, setUpdatingId] = useState<number | null>(null);
	const [form, setForm] = useState<LeadForm>({
		customer_name: "",
		phone: "",
		property_id: "",
		agent_id: "",
		status: "New",
	});

	const loadLeads = async (selectedStatus = statusFilter) => {
		setLoading(true);
		setError(null);
		try {
			const query = selectedStatus ? `?status=${encodeURIComponent(selectedStatus)}` : "";
			const response = await fetch(`${API_URL}/leads${query}`);
			if (!response.ok) {
				throw new Error("Leads could not be loaded.");
			}
			setLeads(await response.json());
		} catch (requestError) {
			setError(errorMessage(requestError, "Leads could not be loaded."));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				const [propertiesResponse, agentsResponse, leadsResponse] = await Promise.all([
					fetch(`${API_URL}/properties`),
					fetch(`${API_URL}/agents`),
					fetch(`${API_URL}/leads`),
				]);
				if (!propertiesResponse.ok || !agentsResponse.ok || !leadsResponse.ok) {
					throw new Error("Some lead workspace data could not be loaded.");
				}
				setProperties(await propertiesResponse.json());
				setAgents(await agentsResponse.json());
				setLeads(await leadsResponse.json());
			} catch (requestError) {
				setError(errorMessage(requestError, "Lead workspace data could not be loaded."));
			} finally {
				setLoading(false);
			}
		};

		void loadInitialData();
	}, []);

	const submitLead = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		setFormError(null);
		setSuccess(null);
		setConfirmation(null);
		try {
			const response = await fetch(`${API_URL}/leads`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					property_id: Number(form.property_id),
					agent_id: Number(form.agent_id),
				}),
			});
			if (!response.ok) {
				throw new Error("The lead could not be added. Check the details and try again.");
			}
			setForm({ customer_name: "", phone: "", property_id: "", agent_id: "", status: "New" });
			setSuccess("Lead added successfully.");
			await loadLeads();
		} catch (requestError) {
			setFormError(errorMessage(requestError, "The lead could not be added. Please try again."));
		} finally {
			setSubmitting(false);
		}
	};

	const updateLead = async (leadId: number, agentId: number, status: string) => {
		setUpdatingId(leadId);
		setError(null);
		setSuccess(null);
		try {
			const response = await fetch(`${API_URL}/leads/${leadId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ agent_id: agentId, status }),
			});
			if (!response.ok) {
				throw new Error("The lead could not be updated.");
			}
			setSuccess("Lead updated successfully.");
			await loadLeads();
		} catch (requestError) {
			setError(errorMessage(requestError, "The lead could not be updated. Please try again."));
		} finally {
			setUpdatingId(null);
		}
	};

	const deleteLead = async (leadId: number) => {
		setDeletingId(leadId);
		setError(null);
		setSuccess(null);
		try {
			const response = await fetch(`${API_URL}/leads/${leadId}`, { method: "DELETE" });
			if (!response.ok) {
				throw new Error("The lead could not be deleted.");
			}
			setConfirmation(null);
			setSuccess("Lead deleted successfully.");
			await loadLeads();
		} catch (requestError) {
			setError(errorMessage(requestError, "The lead could not be deleted. Please try again."));
		} finally {
			setDeletingId(null);
		}
	};

	const visibleLeads = leads.filter((lead) => {
		const query = textSearch.trim().toLowerCase();
		return !query || lead.customer_name.toLowerCase().includes(query) || lead.phone.toLowerCase().includes(query);
	});
	const inputClassName = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

	return (
		<main className="min-h-screen bg-[#f4f7f6] text-slate-900">
			<nav className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
					<Link href="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">P</span><span className="text-lg font-semibold tracking-tight">Property Desk</span></Link>
					<div className="flex items-center gap-6 text-sm font-medium text-slate-500">
						<Link href="/" className="transition-colors hover:text-teal-700">Dashboard</Link>
						<Link href="/properties" className="transition-colors hover:text-teal-700">Properties &amp; Agents</Link>
						<Link href="/leads" className="text-teal-700">Leads</Link>
					</div>
				</div>
			</nav>

			<div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
				<header className="mb-8">
					<p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Pipeline</p>
					<h1 className="text-3xl font-semibold tracking-tight text-slate-950">Leads</h1>
					<p className="mt-2 text-slate-500">Capture, assign, and keep every opportunity moving.</p>
				</header>

				<form onSubmit={submitLead} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-slate-950">Add a lead</h2>
					<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<label className="text-sm font-medium text-slate-700">Customer name<input required className={`${inputClassName} mt-1.5`} value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} /></label>
						<label className="text-sm font-medium text-slate-700">Phone<input required className={`${inputClassName} mt-1.5`} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
						<label className="text-sm font-medium text-slate-700">Property<select required className={`${inputClassName} mt-1.5`} value={form.property_id} onChange={(event) => setForm({ ...form, property_id: event.target.value })}><option value="">Select property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}</select></label>
						<label className="text-sm font-medium text-slate-700">Agent<select required className={`${inputClassName} mt-1.5`} value={form.agent_id} onChange={(event) => setForm({ ...form, agent_id: event.target.value })}><option value="">Select agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
						<label className="text-sm font-medium text-slate-700">Status<select className={`${inputClassName} mt-1.5`} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
					</div>
					<button disabled={submitting} className="mt-5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">{submitting ? "Adding..." : "Add lead"}</button>
					{success && <p className="mt-3 text-sm text-teal-700">{success}</p>}
					{formError && <p role="alert" className="mt-3 text-sm text-rose-700">{formError}</p>}
				</form>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div><h2 className="text-lg font-semibold text-slate-950">Lead list</h2><p className="mt-1 text-sm text-slate-500">Update assignments and status directly from the pipeline.</p></div>
						<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
							<input className={`${inputClassName} sm:w-56`} placeholder="Search name or phone" aria-label="Search lead name or phone" value={textSearch} onChange={(event) => setTextSearch(event.target.value)} />
							<select className={`${inputClassName} sm:w-40`} aria-label="Filter leads by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); void loadLeads(event.target.value); }}><option value="">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
						</div>
					</div>
					{loading && <p className="mt-6 text-sm text-slate-500">Loading leads...</p>}
					{error && <p role="alert" className="mt-6 text-sm text-rose-700">{error}</p>}
					{!loading && !error && visibleLeads.length === 0 && <p className="mt-6 text-sm text-slate-500">No leads found.</p>}
					{!loading && !error && visibleLeads.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3 font-semibold">Customer</th><th className="px-3 py-3 font-semibold">Phone</th><th className="px-3 py-3 font-semibold">Property ID</th><th className="px-3 py-3 font-semibold">Agent</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Created</th><th className="px-3 py-3 font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleLeads.map((lead) => <tr key={lead.id} className="text-slate-700"><td className="px-3 py-4 font-medium text-slate-950">{lead.customer_name}</td><td className="px-3 py-4">{lead.phone}</td><td className="px-3 py-4">{lead.property_id}</td><td className="px-3 py-4"><select aria-label={`Agent for ${lead.customer_name}`} className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm" value={lead.agent_id} disabled={updatingId === lead.id} onChange={(event) => void updateLead(lead.id, Number(event.target.value), lead.status)}>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} ({agent.id})</option>)}</select></td><td className="px-3 py-4"><select aria-label={`Status for ${lead.customer_name}`} className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm" value={lead.status} disabled={updatingId === lead.id} onChange={(event) => void updateLead(lead.id, lead.agent_id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td><td className="px-3 py-4 whitespace-nowrap">{formatDate(lead.created_at)}</td><td className="px-3 py-4">{confirmation === String(lead.id) ? <span className="flex items-center gap-2 whitespace-nowrap"><span className="text-xs text-rose-700">Delete?</span><button type="button" onClick={() => void deleteLead(lead.id)} disabled={deletingId === lead.id} className="font-semibold text-rose-700 hover:text-rose-900">{deletingId === lead.id ? "..." : "Yes"}</button><button type="button" onClick={() => setConfirmation(null)} className="text-slate-500 hover:text-slate-900">No</button></span> : <button type="button" onClick={() => setConfirmation(String(lead.id))} className="font-semibold text-rose-700 hover:text-rose-900">Delete</button>}</td></tr>)}</tbody></table></div>}
				</section>
			</div>
		</main>
	);
}
