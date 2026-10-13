import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { EVENT_TYPES } from "./chat-protocol";
import ChatProductCard from "./chat-product-card";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {
  fetchProductDetails,
  setProductDetails,
} from "@/store/shop/products-slice";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const WS_PATH = import.meta.env.VITE_WS_URL || "ws://localhost:5000/ws/chat";

export default function AiChatWidget() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { productDetails } = useSelector((state) => state.shopProducts);
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const shouldReconnectRef = useRef(true);
  const streamIdRef = useRef(null);

  const connect = () => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const ws = new WebSocket(WS_PATH);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === EVENT_TYPES.STATUS) {
            return;
          }
          if (data.type === EVENT_TYPES.CHAT_RESPONSE_CHUNK) {
            streamIdRef.current = data.id;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.id === data.id && last.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1
                    ? {
                        ...m,
                        content: `${m.content || ""}${data.payload.content || ""}`,
                      }
                    : m,
                );
              }
              return [
                ...prev,
                {
                  id: data.id,
                  role: "assistant",
                  content: data.payload.content || "",
                  products: null,
                  timestamp: data.timestamp,
                },
              ];
            });
            return;
          }
          if (data.type === EVENT_TYPES.CHAT_RESPONSE) {
            setMessages((prev) => {
              const idx = prev.findIndex(
                (m) => m.id === data.id && m.role === "assistant",
              );
              const next = {
                id: data.id,
                role: "assistant",
                content: data.payload.content,
                products: data.payload.products,
                timestamp: data.timestamp,
              };
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = next;
                return copy;
              }
              return [...prev, next];
            });
            setProcessing(false);
            streamIdRef.current = null;
          } else if (data.type === EVENT_TYPES.ORDER_STATUS_UPDATE) {
            setMessages((prev) => [
              ...prev,
              {
                id: data.id,
                role: "system",
                content: `Order ${data.payload.orderId} status: ${data.payload.status}`,
                timestamp: data.timestamp,
              },
            ]);
          } else if (data.type === EVENT_TYPES.ERROR) {
            setError(data.payload.error);
            setProcessing(false);
          }
        } catch (e) {
          console.log(e);
        }
      };

      ws.onerror = () => {
        setError("Connection error");
      };

      ws.onclose = (event) => {
        setConnected(false);
        setConnecting(false);
        setProcessing(false);
        if (event.code === 4001) {
          shouldReconnectRef.current = false;
          setError("Your session expired. Sign in again to use the assistant.");
          return;
        }
        if (shouldReconnectRef.current) {
          reconnectTimerRef.current = setTimeout(connect, 2000);
        }
      };
    } catch (e) {
      setConnecting(false);
      setError("Failed to connect");
    }
  };

  useEffect(() => {
    if (open && isAuthenticated) {
      shouldReconnectRef.current = true;
      connect();
    } else {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
      if (!isAuthenticated) {
        setMessages([]);
        setInput("");
        setError(null);
      }
    }
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [open, isAuthenticated]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !connected || processing) return;
    const msg = {
      id: generateId(),
      type: EVENT_TYPES.CHAT_MESSAGE,
      payload: { content: input.trim() },
    };
    wsRef.current.send(JSON.stringify(msg));
    setMessages((prev) => [
      ...prev,
      {
        id: msg.id,
        role: "user",
        content: input.trim(),
        timestamp: Date.now(),
      },
    ]);
    setInput("");
    setProcessing(true);
    setError(null);
  };

  function handleSelectProduct(id) {
    dispatch(fetchProductDetails(id));
    setDetailsOpen(true);
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg"
        size="icon"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      {open && (
        <div className="fixed bottom-20 right-4 w-[min(380px,calc(100vw-2rem))] h-[480px] bg-white border rounded-lg shadow-xl flex flex-col z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-medium">AI Shopping Assistant</div>
            <div className="flex items-center gap-2">
              <div
                className={`text-xs ${connected ? "text-green-600" : "text-gray-500"}`}
              >
                {connecting
                  ? "Connecting..."
                  : connected
                    ? "Connected"
                    : "Disconnected"}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-3">
            {!connected && !connecting && (
              <div className="text-xs text-gray-500">
                Disconnected. Reconnecting…
              </div>
            )}
            {messages.length === 0 && connected && (
              <div className="text-xs text-gray-500">
                Ask about products, compare, get recommendations, or check order
                status.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div>{m.content}</div>
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.products.map((p) => (
                        <ChatProductCard
                          key={p.id || p._id}
                          product={p}
                          onSelect={handleSelectProduct}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {processing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            {error && <div className="text-xs text-red-600">{error}</div>}
          </div>
          <form onSubmit={sendMessage} className="border-t p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={connected ? "Type a message..." : "Connecting..."}
              disabled={!connected || processing}
              className="flex-1 border rounded px-2 py-1 text-sm"
              maxLength={2000}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!connected || processing || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
      <ProductDetailsDialog
        open={detailsOpen}
        setOpen={(value) => {
          setDetailsOpen(value);
          if (!value) dispatch(setProductDetails());
        }}
        productDetails={productDetails}
      />
    </>
  );
}
