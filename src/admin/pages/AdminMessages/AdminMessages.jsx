import { useEffect, useMemo, useState } from "react";
import {
  FiChevronRight,
  FiMail,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

import "./AdminMessages.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedMessage, setSelectedMessage] =
    useState(null);
  const [deletingId, setDeletingId] = useState("");

  const token =
    localStorage.getItem("jni_tours_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jniToursToken");

  /*
  |--------------------------------------------------------------------------
  | LOAD MESSAGES
  |--------------------------------------------------------------------------
  */

  const loadMessages = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_URL}/api/messages`,
        {
          method: "GET",
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
            "Unable to load messages."
        );
      }

      setMessages(
        Array.isArray(data?.messages)
          ? data.messages
          : []
      );
    } catch (err) {
      console.error(
        "Load messages error:",
        err
      );

      setError(
        err.message ||
          "Unable to load messages."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | COUNTS
  |--------------------------------------------------------------------------
  */

  const unreadCount = useMemo(
    () =>
      messages.filter(
        (message) => !message.isRead
      ).length,
    [messages]
  );

  /*
  |--------------------------------------------------------------------------
  | OPEN MESSAGE
  |--------------------------------------------------------------------------
  */

  const openMessage = async (message) => {
    setSelectedMessage(message);

    if (message.isRead) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/messages/${message._id}/read`,
        {
          method: "PATCH",
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
            "Unable to mark message as read."
        );
      }

      setMessages((current) =>
        current.map((item) =>
          item._id === message._id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      setSelectedMessage((current) =>
        current
          ? {
              ...current,
              isRead: true,
            }
          : current
      );
    } catch (err) {
      console.error(
        "Mark message read error:",
        err
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MESSAGE
  |--------------------------------------------------------------------------
  */

  const closeMessage = () => {
    setSelectedMessage(null);
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE MESSAGE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (message) => {
    const senderName =
      getFullName(message.sender);

    const confirmed = window.confirm(
      `Delete this message from ${senderName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(message._id);
      setError("");

      const response = await fetch(
        `${API_URL}/api/messages/${message._id}`,
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
            "Unable to delete message."
        );
      }

      setMessages((current) =>
        current.filter(
          (item) =>
            item._id !== message._id
        )
      );

      if (
        selectedMessage?._id ===
        message._id
      ) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error(
        "Delete message error:",
        err
      );

      setError(
        err.message ||
          "Unable to delete message."
      );
    } finally {
      setDeletingId("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  function getFullName(user) {
    if (!user) {
      return "Unknown user";
    }

    const name =
      `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim();

    return name || "Unknown user";
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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
  }

  function formatDateTime(date) {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <section className="admin-messages-page">
      {/* HEADER */}

      <div className="admin-messages-header">
        <div className="admin-messages-header-content">
          <span className="admin-messages-eyebrow">
            <FiMail />
            Communication
          </span>

          <h1>Messages</h1>

          <p>
            View and manage messages between
            JNI Tours and registered customers.
          </p>
        </div>

        <div className="admin-messages-summary">
          <div>
            <strong>
              {messages.length}
            </strong>
            <span>Total messages</span>
          </div>

          <div>
            <strong>
              {unreadCount}
            </strong>
            <span>Unread</span>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="admin-messages-error">
          {error}
        </div>
      )}

      {/* TOOLBAR */}

      <div className="admin-messages-toolbar">
        <div>
          <strong>Inbox</strong>

          {unreadCount > 0 && (
            <span>
              {unreadCount} unread
            </span>
          )}
        </div>

        <button
          type="button"
          className="admin-messages-refresh"
          onClick={() =>
            loadMessages(true)
          }
          disabled={refreshing}
        >
          <FiRefreshCw
            className={
              refreshing
                ? "is-spinning"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* CONTENT */}

      {loading ? (
        <div className="admin-messages-state">
          <div className="admin-messages-spinner" />

          <h2>Loading messages...</h2>

          <p>
            Please wait while we retrieve
            your messages.
          </p>
        </div>
      ) : messages.length === 0 ? (
        <div className="admin-messages-state">
          <div className="admin-messages-state-icon">
            <FiMail />
          </div>

          <h2>No messages yet</h2>

          <p>
            Messages sent by customers or
            from the admin panel will appear
            here.
          </p>
        </div>
      ) : (
        <div className="admin-messages-list">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`admin-message-row ${
                message.isRead
                  ? "read"
                  : "unread"
              }`}
            >
              <button
                type="button"
                className="admin-message-main"
                onClick={() =>
                  openMessage(message)
                }
              >
                <div className="admin-message-avatar">
                  {message.sender
                    ?.avatar ? (
                    <img
                      src={
                        message.sender
                          .avatar
                      }
                      alt={getFullName(
                        message.sender
                      )}
                    />
                  ) : (
                    <FiUser />
                  )}
                </div>

                <div className="admin-message-content">
                  <div className="admin-message-top">
                    <strong>
                      {getFullName(
                        message.sender
                      )}
                    </strong>

                    <span>
                      {message.isRead
                        ? "Read"
                        : "New"}
                    </span>
                  </div>

                  <div className="admin-message-subject">
                    {message.subject ||
                      "No subject"}
                  </div>

                  <p>
                    {message.message}
                  </p>

                  <time>
                    {formatDate(
                      message.createdAt
                    )}
                  </time>
                </div>

                <FiChevronRight className="admin-message-arrow" />
              </button>

              <button
                type="button"
                className="admin-message-delete"
                onClick={() =>
                  handleDelete(message)
                }
                disabled={
                  deletingId ===
                  message._id
                }
                title="Delete message"
              >
                <FiTrash2 />

                {deletingId ===
                  message._id && (
                  <span>...</span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MESSAGE MODAL */}

      {selectedMessage && (
        <div
          className="admin-message-view-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeMessage();
            }
          }}
        >
          <div className="admin-message-view">
            <div className="admin-message-view-header">
              <div>
                <span>
                  Customer message
                </span>

                <h2>
                  {selectedMessage.subject ||
                    "No subject"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeMessage}
                className="admin-message-view-close"
              >
                <FiX />
              </button>
            </div>

            <div className="admin-message-view-sender">
              <div className="admin-message-avatar">
                {selectedMessage.sender
                  ?.avatar ? (
                  <img
                    src={
                      selectedMessage
                        .sender.avatar
                    }
                    alt={getFullName(
                      selectedMessage.sender
                    )}
                  />
                ) : (
                  <FiUser />
                )}
              </div>

              <div>
                <strong>
                  {getFullName(
                    selectedMessage.sender
                  )}
                </strong>

                <span>
                  {selectedMessage.sender
                    ?.email ||
                    "No email"}
                </span>

                <small>
                  {formatDateTime(
                    selectedMessage.createdAt
                  )}
                </small>
              </div>
            </div>

            <div className="admin-message-view-body">
              {selectedMessage.message}
            </div>

            <div className="admin-message-view-actions">
              <button
                type="button"
                className="admin-message-view-delete"
                onClick={() =>
                  handleDelete(
                    selectedMessage
                  )
                }
                disabled={
                  deletingId ===
                  selectedMessage._id
                }
              >
                <FiTrash2 />
                {deletingId ===
                selectedMessage._id
                  ? "Deleting..."
                  : "Delete message"}
              </button>

              <button
                type="button"
                className="admin-message-view-close-button"
                onClick={closeMessage}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminMessages;