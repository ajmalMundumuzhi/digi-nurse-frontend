
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, FileText, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import DoctorOrderForm from "../components/doctor-orders/DoctorOrderForm";
import DoctorOrderList from "../components/doctor-orders/DoctorOrderList";
import DoctorOrderDetails from "../components/doctor-orders/DoctorOrderDetails";
import { getActiveEncounters } from "../services/nursingRecordService";
import {
  acknowledgeDoctorOrder,
  authenticateDoctorOrder,
  createDoctorOrder,
  getCurrentUser,
  getDoctorOrders
} from "../services/doctorOrderService";

const statuses = [
  { value: "", label: "All statuses" },
  { value: "pending_authentication", label: "Pending authentication" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "discontinued", label: "Discontinued" }
];

const types = [
  { value: "", label: "All order types" },
  { value: "medication", label: "Medication" },
  { value: "lab", label: "Laboratory" },
  { value: "imaging", label: "Imaging" },
  { value: "procedure", label: "Procedure" },
  { value: "nursing_instruction", label: "Nursing instruction" },
  { value: "other", label: "Other" }
];

export default function DoctorOrdersPage() {
  const [encounters, setEncounters] = useState([]);
  const [encounterId, setEncounterId] = useState("");
  const [orders, setOrders] = useState([]);
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEncounters, setLoadingEncounters] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoadingEncounters(true);

      try {
        const [encounterResult, userResult] = await Promise.all([
          getActiveEncounters(),
          getCurrentUser()
        ]);

        if (!active) return;

        setEncounters(encounterResult);
        setEncounterId((current) => (
          current && encounterResult.some((item) => item._id === current)
            ? current
            : encounterResult[0]?._id || ""
        ));
        setRole(userResult.role || "");
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            "Could not load your user role or active encounters. Please verify your login and backend connection."
          );
        }
      } finally {
        if (active) setLoadingEncounters(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const loadOrders = useCallback(async () => {
    if (!encounterId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getDoctorOrders({
        encounterId,
        status: statusFilter,
        limit: 100
      });

      setOrders(result.orders);
    } catch (requestError) {
      setOrders([]);
      setError(
        requestError.response?.data?.message ||
        "Could not load orders for this encounter."
      );
    } finally {
      setLoading(false);
    }
  }, [encounterId, statusFilter, reloadKey]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createDoctorOrder(payload);
      setShowForm(false);
      setNotice("Order created and sent for authentication.");
      await loadOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Could not create the order. Verify your role and required fields."
      );
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  const handleAuthenticate = async (order) => {
    const confirmed = window.confirm(
      `Authenticate order "${order.title}"? Only the ordering doctor can authenticate this order.`
    );

    if (!confirmed) return;

    setBusyOrderId(order._id);
    setError("");
    setNotice("");

    try {
      await authenticateDoctorOrder(order._id);
      setNotice("Order authenticated successfully.");
      await loadOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Unable to authenticate this order."
      );
    } finally {
      setBusyOrderId("");
    }
  };

  const handleAcknowledge = async (order) => {
    const confirmed = window.confirm(
      `Acknowledge that you have received order "${order.title}"?`
    );

    if (!confirmed) return;

    setBusyOrderId(order._id);
    setError("");
    setNotice("");

    try {
      await acknowledgeDoctorOrder(order._id, { status: "acknowledged" });
      setNotice("Order acknowledgement recorded.");
      await loadOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Unable to acknowledge this order."
      );
    } finally {
      setBusyOrderId("");
    }
  };

  const visibleOrders = orders.filter(
    (order) => !typeFilter || order.orderType === typeFilter
  );

  const canCreate = role === "doctor";

  return (
    <>
      <PageHeader
        eyebrow="CARE COORDINATION"
        title="Doctor orders"
        description="Review order status, authentication, and nursing acknowledgements for an encounter."
        action={
          canCreate ? (
            <button
              onClick={() => {
                setError("");
                setNotice("");
                setShowForm(true);
              }}
              disabled={!encounters.length || loadingEncounters}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              New order
            </button>
          ) : null
        }
      />

      {notice && (
        <div role="status" className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">Orders request failed</p>
            <p className="mt-1 break-words text-xs leading-5 text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <Field label="Active encounter">
            <select
              value={encounterId}
              onChange={(event) => setEncounterId(event.target.value)}
              disabled={loadingEncounters || !encounters.length}
              className={inputClass}
            >
              <option value="">
                {loadingEncounters ? "Loading encounters..." : "Choose an encounter"}
              </option>
              {encounters.map((encounter) => (
                <option key={encounter._id} value={encounter._id}>
                  {encounter.encounterNumber || encounter.encounterId || encounter._id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Order status">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClass}
            >
              {statuses.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Order type">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className={inputClass}
            >
              {types.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </Field>

          <div className="flex items-end">
            <button
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading || !encounterId}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh orders
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-y border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-700">
            <FileText size={17} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Order history</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {loading ? "Loading orders..." : `${visibleOrders.length} order${visibleOrders.length === 1 ? "" : "s"} shown`}
            </p>
          </div>
          {role && (
            <span className="ml-auto rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold capitalize text-slate-500">
              {role.replaceAll("_", " ")}
            </span>
          )}
        </div>

        {loading || loadingEncounters ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3">
            <LoaderCircle size={27} className="animate-spin text-teal-700" />
            <p className="text-sm text-slate-500">Loading order history...</p>
          </div>
        ) : !encounters.length ? (
          <EmptyState message="No active encounters are available for this account." />
        ) : !error ? (
          <DoctorOrderList
            orders={visibleOrders}
            role={role}
            busyOrderId={busyOrderId}
            onView={setSelectedOrder}
            onAuthenticate={handleAuthenticate}
            onAcknowledge={handleAcknowledge}
          />
        ) : (
          <EmptyState message="Order history is unavailable. Retry the request to continue." />
        )}
      </section>

      {showForm && (
        <DoctorOrderForm
          encounters={encounters}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {selectedOrder && (
        <DoctorOrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
      <AlertCircle size={24} className="text-amber-600" />
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}

const inputClass = "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";
