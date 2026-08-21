import { useEffect, useMemo, useState } from "react";
import {
  FiMail,
  FiPhone,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import "./AdminCustomers.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [messageSubject, setMessageSubject] =
    useState("");

  const [messageBody, setMessageBody] =
    useState("");

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | AUTH TOKEN
  |--------------------------------------------------------------------------
  */

  const token = localStorage.getItem(
  "jni_tours_token"
);

  /*
  |--------------------------------------------------------------------------
  | LOAD CUSTOMERS
  |--------------------------------------------------------------------------
  */

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
  `${API_URL}/api/messages`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      recipientId: selectedCustomer._id,
      subject: messageSubject.trim(),
      message: messageBody.trim(),
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load customers."
        );
      }

      setCustomers(
        Array.isArray(data?.customers)
          ? data.customers
          : Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (err) {
      console.error(
        "Load customers error:",
        err
      );

      setError(
        err.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER COUNT
  |--------------------------------------------------------------------------
  */

  const customerCount = useMemo(
    () => customers.length,
    [customers]
  );

  /*
  |--------------------------------------------------------------------------
  | FULL NAME
  |--------------------------------------------------------------------------
  */

  const getFullName = (customer) => {
    const name =
      `${customer?.firstName || ""} ${
        customer?.lastName || ""
      }`.trim();

    return name || "Unnamed customer";
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE CUSTOMER
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (customer) => {
    const customerName =
      getFullName(customer);

    const confirmed = window.confirm(
      `Delete ${customerName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(customer._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/customers/${customer._id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to delete customer."
        );
      }

      setCustomers((current) =>
        current.filter(
          (item) =>
            item._id !== customer._id
        )
      );

      if (
        selectedCustomer?._id ===
        customer._id
      ) {
        setSelectedCustomer(null);
      }

      setMessage(
        `${customerName} was deleted successfully.`
      );
    } catch (err) {
      console.error(
        "Delete customer error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete customer."
      );
    } finally {
      setDeletingId("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN MESSAGE MODAL
  |--------------------------------------------------------------------------
  */

  const openMessageModal = (customer) => {
    setSelectedCustomer(customer);
    setMessageSubject("");
    setMessageBody("");
    setError("");
    setMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MESSAGE MODAL
  |--------------------------------------------------------------------------
  */

  const closeMessageModal = () => {
    if (sendingMessage) {
      return;
    }

    setSelectedCustomer(null);
    setMessageSubject("");
    setMessageBody("");
    setError("");
    setMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedCustomer) {
      return;
    }

    const subject =
      messageSubject.trim();

    const body =
      messageBody.trim();

    if (!body) {
      setError(
        "Please enter a message."
      );
      return;
    }

    try {
      setSendingMessage(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/customers/${selectedCustomer._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject,
            message: body,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to send message."
        );
      }

      setMessage(
        "Message sent successfully."
      );

      setMessageSubject("");
      setMessageBody("");

      setTimeout(() => {
        setSelectedCustomer(null);
        setMessage("");
      }, 1000);
    } catch (err) {
      console.error(
        "Send customer message error:",
        err
      );

      setError(
        err.message ||
          "Unable to send message."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <section className="admin-customers-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-customers-header">

        <div>
          <span className="admin-customers-eyebrow">
            <FiUsers />
            Customer management
          </span>

          <h1>
            Registered Customers
          </h1>

          <p>
            View and manage customers who
            have registered with JNI Tours.
          </p>
        </div>

        <div className="admin-customers-count">
          <strong>
            {customerCount}
          </strong>

          <span>
            Registered users
          </span>
        </div>

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && !selectedCustomer && (
        <div className="admin-customers-alert success">
          {message}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && !selectedCustomer && (
        <div className="admin-customers-alert error">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="admin-customers-state">

          <div className="admin-customers-spinner" />

          <h2>
            Loading customers...
          </h2>

          <p>
            Please wait while we retrieve
            the registered users.
          </p>

        </div>
      ) : customers.length === 0 ? (

        /* ===================================================
           EMPTY
        =================================================== */

        <div className="admin-customers-state">

          <FiUsers />

          <h2>
            No registered customers
          </h2>

          <p>
            Customers who create accounts
            will appear here.
          </p>

        </div>
      ) : (

        /* ===================================================
           CUSTOMER TABLE
        =================================================== */

        <div className="admin-customers-card">

          <div className="admin-customers-table-wrapper">

            <table className="admin-customers-table">

              <thead>
                <tr>
                  <th>
                    Customer
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Country
                  </th>

                  <th>
                    Registered
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {customers.map(
                  (customer) => (
                    <tr
                      key={
                        customer._id
                      }
                    >

                      {/* CUSTOMER */}

                      <td>

                        <div className="admin-customer-info">

                          <div className="admin-customer-avatar">

                            {customer.avatar ? (
                              <img
                                src={
                                  customer.avatar
                                }
                                alt={getFullName(
                                  customer
                                )}
                              />
                            ) : (
                              <FiUser />
                            )}

                          </div>

                          <div>

                            <strong>
                              {getFullName(
                                customer
                              )}
                            </strong>

                            <span>
                              {customer.email ||
                                "No email"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* CONTACT */}

                      <td>

                        <div className="admin-customer-contact">

                          <span>
                            <FiMail />
                            {customer.email ||
                              "—"}
                          </span>

                          {customer.phone && (
                            <span>
                              <FiPhone />
                              {customer.phone}
                            </span>
                          )}

                        </div>

                      </td>

                      {/* COUNTRY */}

                      <td>
                        {customer.country ||
                          "—"}
                      </td>

                      {/* REGISTERED */}

                      <td>
                        {formatDate(
                          customer.createdAt
                        )}
                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`admin-customer-status ${
                            customer.isActive ===
                            false
                              ? "inactive"
                              : "active"
                          }`}
                        >
                          {customer.isActive ===
                          false
                            ? "Inactive"
                            : "Active"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="admin-customer-actions">

                          <button
                            type="button"
                            className="admin-customer-message"
                            onClick={() =>
                              openMessageModal(
                                customer
                              )
                            }
                            title="Message customer"
                          >
                            <FiMail />
                          </button>

                          <button
                            type="button"
                            className="admin-customer-delete"
                            onClick={() =>
                              handleDelete(
                                customer
                              )
                            }
                            disabled={
                              deletingId ===
                              customer._id
                            }
                            title="Delete customer"
                          >
                            <FiTrash2 />

                            {deletingId ===
                              customer._id && (
                              <span>
                                ...
                              </span>
                            )}
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* =====================================================
          MESSAGE MODAL
      ===================================================== */}

      {selectedCustomer && (

        <div
          className="admin-message-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeMessageModal();
            }
          }}
        >

          <div className="admin-message-modal">

            {/* MODAL HEADER */}

            <div className="admin-message-modal-header">

              <div>

                <span>
                  Send message
                </span>

                <h2>
                  {getFullName(
                    selectedCustomer
                  )}
                </h2>

                <p>
                  {selectedCustomer.email ||
                    "No email address"}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeMessageModal
                }
                disabled={
                  sendingMessage
                }
                className="admin-message-modal-close"
                title="Close"
              >
                <FiX />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSendMessage
              }
              className="admin-message-form"
            >

              <label>
                Subject

                <input
                  type="text"
                  value={
                    messageSubject
                  }
                  onChange={(event) =>
                    setMessageSubject(
                      event.target.value
                    )
                  }
                  placeholder="Message subject"
                  maxLength={150}
                />
              </label>

              <label>
                Message

                <textarea
                  value={messageBody}
                  onChange={(event) =>
                    setMessageBody(
                      event.target.value
                    )
                  }
                  placeholder="Write your message..."
                  rows={7}
                  maxLength={3000}
                  required
                />
              </label>

              {message && (
                <div className="admin-customers-alert success">
                  {message}
                </div>
              )}

              {error && (
                <div className="admin-customers-alert error">
                  {error}
                </div>
              )}

              <div className="admin-message-form-actions">

                <button
                  type="button"
                  onClick={
                    closeMessageModal
                  }
                  disabled={
                    sendingMessage
                  }
                  className="admin-message-cancel"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    sendingMessage ||
                    !messageBody.trim()
                  }
                  className="admin-message-send"
                >
                  <FiMail />

                  {sendingMessage
                    ? "Sending..."
                    : "Send message"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default AdminCustomers;