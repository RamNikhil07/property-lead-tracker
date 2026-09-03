"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Property = {
	id: number;
	title: string;
	location: string;
	property_type: string;
	price: number;
};

type Agent = {
	id: number;
	name: string;
	email: string;
	phone: string;
};

type PropertyForm = {
	title: string;
	location: string;
	property_type: string;
	price: string;
};

type AgentForm = {
	name: string;
	email: string;
	phone: string;
};

const API_URL = "http://127.0.0.1:8000/api";

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

function formatPrice(price: number) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(price);
}

export default function PropertiesPage() {
	const [properties, setProperties] = useState<Property[]>([]);
	const [agents, setAgents] = useState<Agent[]>([]);
	const [propertySearch, setPropertySearch] = useState("");
	const [propertyLoading, setPropertyLoading] = useState(true);
	const [agentLoading, setAgentLoading] = useState(true);
	const [propertyError, setPropertyError] = useState<string | null>(null);
	const [agentError, setAgentError] = useState<string | null>(null);
	const [propertyForm, setPropertyForm] = useState<PropertyForm>({
		title: "",
		location: "",
		property_type: "",
		price: "",
	});
	const [agentForm, setAgentForm] = useState<AgentForm>({
		name: "",
		email: "",
		phone: "",
	});
	const [propertySubmitting, setPropertySubmitting] = useState(false);
	const [agentSubmitting, setAgentSubmitting] = useState(false);
	const [propertySuccess, setPropertySuccess] = useState<string | null>(null);
	const [agentSuccess, setAgentSuccess] = useState<string | null>(null);
	const [propertySubmitError, setPropertySubmitError] = useState<string | null>(null);
	const [agentSubmitError, setAgentSubmitError] = useState<string | null>(null);

	const loadProperties = async (search = propertySearch) => {
		setPropertyLoading(true);
		setPropertyError(null);
		try {
			const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
			const response = await fetch(`${API_URL}/properties${query}`);
			if (!response.ok) {
				throw new Error("Properties could not be loaded.");
			}
			setProperties(await response.json());
		} catch (error) {
			setPropertyError(getErrorMessage(error, "Properties could not be loaded."));
		} finally {
			setPropertyLoading(false);
		}
	};

	const loadAgents = async () => {
		setAgentLoading(true);
		setAgentError(null);
		try {
			const response = await fetch(`${API_URL}/agents`);
			if (!response.ok) {
				throw new Error("Agents could not be loaded.");
			}
			setAgents(await response.json());
		} catch (error) {
			setAgentError(getErrorMessage(error, "Agents could not be loaded."));
		} finally {
			setAgentLoading(false);
		}
	};

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				const [propertiesResponse, agentsResponse] = await Promise.all([
					fetch(`${API_URL}/properties`),
					fetch(`${API_URL}/agents`),
				]);
				if (!propertiesResponse.ok) {
					throw new Error("Properties could not be loaded.");
				}
				if (!agentsResponse.ok) {
					throw new Error("Agents could not be loaded.");
				}
				setProperties(await propertiesResponse.json());
				setAgents(await agentsResponse.json());
			} catch (error) {
				const message = getErrorMessage(error, "The workspace data could not be loaded.");
				setPropertyError(message.includes("Properties") ? message : "Properties could not be loaded.");
				setAgentError(message.includes("Agents") ? message : "Agents could not be loaded.");
			} finally {
				setPropertyLoading(false);
				setAgentLoading(false);
			}
		};

		void loadInitialData();
	}, []);

	const handlePropertySearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void loadProperties();
	};

	const handlePropertySubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setPropertySubmitting(true);
		setPropertySuccess(null);
		setPropertySubmitError(null);
		try {
			const response = await fetch(`${API_URL}/properties`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...propertyForm,
					price: Number(propertyForm.price),
				}),
			});
			if (!response.ok) {
				throw new Error("The property could not be added. Check the details and try again.");
			}
			setPropertyForm({ title: "", location: "", property_type: "", price: "" });
			setPropertySuccess("Property added successfully.");
			await loadProperties();
		} catch (error) {
			setPropertySubmitError(
				getErrorMessage(error, "The property could not be added. Please try again."),
			);
		} finally {
			setPropertySubmitting(false);
		}
	};

	const handleAgentSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setAgentSubmitting(true);
		setAgentSuccess(null);
		setAgentSubmitError(null);
		try {
			const response = await fetch(`${API_URL}/agents`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(agentForm),
			});
			if (!response.ok) {
				throw new Error("The agent could not be added. Check the details and try again.");
			}
			setAgentForm({ name: "", email: "", phone: "" });
			setAgentSuccess("Agent added successfully.");
			await loadAgents();
		} catch (error) {
			setAgentSubmitError(getErrorMessage(error, "The agent could not be added. Please try again."));
		} finally {
			setAgentSubmitting(false);
		}
	};

	const inputClassName =
		"w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

	return (
		<main className="min-h-screen bg-[#f4f7f6] text-slate-900">
			<nav className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
					<Link href="/" className="flex items-center gap-3">
						<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">P</span>
						<span className="text-lg font-semibold tracking-tight">Property Desk</span>
					</Link>
					<div className="flex items-center gap-6 text-sm font-medium text-slate-500">
						<Link href="/" className="transition-colors hover:text-teal-700">Dashboard</Link>
						<Link href="/properties" className="text-teal-700">Properties &amp; Agents</Link>
						<Link href="/leads" className="transition-colors hover:text-teal-700">Leads</Link>
					</div>
				</div>
			</nav>

			<div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
				<header className="mb-8">
					<p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Workspace</p>
					<h1 className="text-3xl font-semibold tracking-tight text-slate-950">Properties &amp; Agents</h1>
					<p className="mt-2 text-slate-500">Manage your inventory and the people guiding each opportunity.</p>
				</header>

				<section className="grid gap-6 lg:grid-cols-2">
					<form onSubmit={handlePropertySubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-950">Add a property</h2>
						<div className="mt-5 grid gap-4 sm:grid-cols-2">
							<label className="text-sm font-medium text-slate-700 sm:col-span-2">
								Title
								<input required value={propertyForm.title} onChange={(event) => setPropertyForm({ ...propertyForm, title: event.target.value })} className={`${inputClassName} mt-1.5`} placeholder="e.g. Koramangala Garden Villa" />
							</label>
							<label className="text-sm font-medium text-slate-700">
								Location
								<input required value={propertyForm.location} onChange={(event) => setPropertyForm({ ...propertyForm, location: event.target.value })} className={`${inputClassName} mt-1.5`} placeholder="Bengaluru" />
							</label>
							<label className="text-sm font-medium text-slate-700">
								Property type
								<input required value={propertyForm.property_type} onChange={(event) => setPropertyForm({ ...propertyForm, property_type: event.target.value })} className={`${inputClassName} mt-1.5`} placeholder="Apartment" />
							</label>
							<label className="text-sm font-medium text-slate-700">
								Price
								<input required min="0" step="1" type="number" value={propertyForm.price} onChange={(event) => setPropertyForm({ ...propertyForm, price: event.target.value })} className={`${inputClassName} mt-1.5`} placeholder="12500000" />
							</label>
						</div>
						<button disabled={propertySubmitting} className="mt-5 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
							{propertySubmitting ? "Adding..." : "Add property"}
						</button>
						{propertySuccess && <p className="mt-3 text-sm text-teal-700">{propertySuccess}</p>}
						{propertySubmitError && <p role="alert" className="mt-3 text-sm text-rose-700">{propertySubmitError}</p>}
					</form>

					<form onSubmit={handleAgentSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-950">Add an agent</h2>
						<div className="mt-5 grid gap-4">
							<label className="text-sm font-medium text-slate-700">
								Name
								<input required value={agentForm.name} onChange={(event) => setAgentForm({ ...agentForm, name: event.target.value })} className={`${inputClassName} mt-1.5`} placeholder="Ananya Rao" />
							</label>
							<label className="text-sm font-medium text-slate-700">
								Email
								<input required type="email" value={agentForm.email} onChange={(event) => setAgentForm({ ...agentForm, email: event.target.value })} className={`${inputClassName} mt-1.5`} placeholder="ananya@example.com" />
							</label>
							<label className="text-sm font-medium text-slate-700">
								Phone
								<input required value={agentForm.phone} onChange={(event) => setAgentForm({ ...agentForm, phone: event.target.value })} className={`${inputClassName} mt-1.5`} placeholder="+91 90000 00000" />
							</label>
						</div>
						<button disabled={agentSubmitting} className="mt-5 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">
							{agentSubmitting ? "Adding..." : "Add agent"}
						</button>
						{agentSuccess && <p className="mt-3 text-sm text-teal-700">{agentSuccess}</p>}
						{agentSubmitError && <p role="alert" className="mt-3 text-sm text-rose-700">{agentSubmitError}</p>}
					</form>
				</section>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
						<div>
							<h2 className="text-lg font-semibold text-slate-950">Properties</h2>
							<p className="mt-1 text-sm text-slate-500">Search and review your current inventory.</p>
						</div>
						<form onSubmit={handlePropertySearch} className="flex w-full gap-2 sm:w-auto">
							<input value={propertySearch} onChange={(event) => setPropertySearch(event.target.value)} className={`${inputClassName} sm:w-64`} placeholder="Search properties" aria-label="Search properties" />
							<button className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-700">Search</button>
						</form>
					</div>
					{propertyLoading && <p className="mt-6 text-sm text-slate-500">Loading properties...</p>}
					{propertyError && <p role="alert" className="mt-6 text-sm text-rose-700">{propertyError}</p>}
					{!propertyLoading && !propertyError && properties.length === 0 && <p className="mt-6 text-sm text-slate-500">No properties found.</p>}
					{!propertyLoading && !propertyError && properties.length > 0 && (
						<div className="mt-5 overflow-x-auto">
							<table className="w-full min-w-[620px] text-left text-sm">
								<thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
									<tr><th className="px-3 py-3 font-semibold">Title</th><th className="px-3 py-3 font-semibold">Location</th><th className="px-3 py-3 font-semibold">Type</th><th className="px-3 py-3 text-right font-semibold">Price</th></tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{properties.map((property) => <tr key={property.id} className="text-slate-700"><td className="px-3 py-4 font-medium text-slate-950">{property.title}</td><td className="px-3 py-4">{property.location}</td><td className="px-3 py-4">{property.property_type}</td><td className="px-3 py-4 text-right font-medium">{formatPrice(property.price)}</td></tr>)}
								</tbody>
							</table>
						</div>
					)}
				</section>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div>
						<h2 className="text-lg font-semibold text-slate-950">Agents</h2>
						<p className="mt-1 text-sm text-slate-500">Your property team and contact details.</p>
					</div>
					{agentLoading && <p className="mt-6 text-sm text-slate-500">Loading agents...</p>}
					{agentError && <p role="alert" className="mt-6 text-sm text-rose-700">{agentError}</p>}
					{!agentLoading && !agentError && agents.length === 0 && <p className="mt-6 text-sm text-slate-500">No agents found.</p>}
					{!agentLoading && !agentError && agents.length > 0 && (
						<div className="mt-5 overflow-x-auto">
							<table className="w-full min-w-[520px] text-left text-sm">
								<thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
									<tr><th className="px-3 py-3 font-semibold">Name</th><th className="px-3 py-3 font-semibold">Email</th><th className="px-3 py-3 font-semibold">Phone</th></tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{agents.map((agent) => <tr key={agent.id} className="text-slate-700"><td className="px-3 py-4 font-medium text-slate-950">{agent.name}</td><td className="px-3 py-4">{agent.email}</td><td className="px-3 py-4">{agent.phone}</td></tr>)}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
