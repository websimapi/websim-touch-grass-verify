import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
const { useState, useEffect, useRef, useCallback } = React;
const playSound = (type) => {
  const audio = new Audio();
  switch (type) {
    case "shutter":
      audio.src = "shutter.mp3";
      break;
    case "success":
      audio.src = "success.mp3";
      break;
    case "fail":
      audio.src = "fail.mp3";
      break;
    default:
      return;
  }
  audio.play().catch((e) => console.log("Audio play blocked", e));
};
const room = new WebsimSocket();
const useGrassData = () => {
  const [userRecord, setUserRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const init = async () => {
      const user = await window.websim.getCurrentUser();
      const unsubscribe = room.collection("grass_wallet").filter({ username: user.username }).subscribe(async (records) => {
        if (records.length > 0) {
          setUserRecord(records[0]);
        } else {
          try {
            const newRecord = await room.collection("grass_wallet").create({
              balance: 0,
              history: [],
              // Stores verification hashes
              last_touch: null
            });
            setUserRecord(newRecord);
          } catch (e) {
            console.error("Creation error (might be race condition):", e);
          }
        }
        setLoading(false);
      });
      return unsubscribe;
    };
    init();
  }, []);
  const addCurrency = async (amount, hashData) => {
    if (!userRecord) return;
    const newHistory = [hashData, ...userRecord.history].slice(0, 50);
    await room.collection("grass_wallet").update(userRecord.id, {
      balance: userRecord.balance + amount,
      history: newHistory,
      last_touch: (/* @__PURE__ */ new Date()).toISOString()
    });
  };
  return { userRecord, loading, addCurrency };
};
const CameraView = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Could not access camera. Please allow permissions.");
        onCancel();
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  const takePhoto = () => {
    if (!videoRef.current) return;
    playSound("shutter");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    onCapture(dataUrl);
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "fixed inset-0 bg-black z-50 flex flex-col", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "relative flex-1 bg-black overflow-hidden", children: [
      /* @__PURE__ */ jsxDEV(
        "video",
        {
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          className: "absolute inset-0 w-full h-full object-cover"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 115,
          columnNumber: 17
        }
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 scanner-overlay pointer-events-none" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 121,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "scan-line pointer-events-none" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 122,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-green-400 text-xs font-mono", children: "REC \u25CF AI_VISION_ACTIVE" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 124,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 114,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "h-32 bg-black flex items-center justify-center gap-8 relative", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: onCancel,
          className: "absolute left-8 text-white/70 hover:text-white",
          children: "Cancel"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 130,
          columnNumber: 17
        }
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: takePhoto,
          className: "w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition-all",
          children: /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 bg-white rounded-full" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 141,
            columnNumber: 21
          })
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 137,
          columnNumber: 17
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 129,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 113,
    columnNumber: 9
  });
};
const AnalyzingView = () => {
  const [text, setText] = useState("Establishing Neural Link...");
  useEffect(() => {
    const msgs = [
      "Scanning for Chlorophyll...",
      "Detecting Skin Contact...",
      "Hashing Environmental Data...",
      "Verifying Grass Authenticity..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setText(msgs[i % msgs.length]);
      i++;
    }, 1500);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsxDEV("div", { className: "fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-green-500 font-mono p-6 text-center", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 border-4 border-t-green-500 border-green-900 rounded-full animate-spin mb-6" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 169,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "text-xl animate-pulse", children: text }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 170,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "mt-4 text-xs text-green-800 max-w-xs break-all", children: [
      "0x",
      Math.random().toString(16).substr(2, 20),
      "..."
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 171,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 168,
    columnNumber: 9
  });
};
const App = () => {
  const { userRecord, loading, addCurrency } = useGrassData();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const handleVerify = async (imageDataUrl) => {
    setCameraOpen(false);
    setAnalyzing(true);
    setResult(null);
    try {
      const completion = await window.websim.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a strict Touch Grass Verification AI. 
                        Analyze the image.
                        Criteria:
                        1. Must be REAL grass (not fake, not carpet).
                        2. Must show a HUMAN HAND physically touching the grass.
                        
                        Return JSON only:
                        {
                            "verified": boolean,
                            "reason": "short string explaining why verified or rejected",
                            "content_hash": "A unique, detailed string describing the specific hand pose, lighting, grass type, and surrounding objects to fingerprint this specific photo. e.g. 'Left hand index finger touching Poa annua, harsh sunlight from top-right, blue shoe visible in corner'."
                        }`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Verify this touch event." },
              { type: "image_url", image_url: { url: imageDataUrl } }
            ]
          }
        ],
        json: true
      });
      const aiData = JSON.parse(completion.content);
      console.log("AI Analysis:", aiData);
      if (!aiData.verified) {
        playSound("fail");
        setResult({
          success: false,
          message: aiData.reason || "Grass verification failed."
        });
      } else {
        const isDuplicate = userRecord.history.some((h) => h.hash === aiData.content_hash);
        if (isDuplicate) {
          playSound("fail");
          setResult({
            success: false,
            message: "Duplicate image detected! Touch NEW grass."
          });
        } else {
          playSound("success");
          const earned = 100;
          await addCurrency(earned, {
            hash: aiData.content_hash,
            timestamp: Date.now(),
            reason: aiData.reason
          });
          setResult({
            success: true,
            message: "Grass Touched Successfully!",
            gained: earned
          });
        }
      }
    } catch (error) {
      console.error(error);
      setResult({ success: false, message: "AI Connection Lost." });
    } finally {
      setAnalyzing(false);
    }
  };
  if (loading) return /* @__PURE__ */ jsxDEV("div", { className: "h-screen flex items-center justify-center text-green-500 font-mono", children: "Loading Wallet..." }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 269,
    columnNumber: 25
  });
  return /* @__PURE__ */ jsxDEV("div", { className: "h-screen flex flex-col relative max-w-md mx-auto bg-gray-900 shadow-2xl overflow-hidden", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "p-6 pt-8 bg-gradient-to-b from-green-900/40 to-transparent", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "pixel-font text-xl text-green-400", children: "TOUCH GRASS" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 276,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-3 h-3 rounded-full bg-green-500 animate-pulse" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 278,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-mono text-green-300", children: "ONLINE" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 279,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 277,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 275,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "bg-black/40 p-4 rounded-xl border border-green-800/50 backdrop-blur-sm", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-gray-400 mb-1 uppercase tracking-wider", children: "Current Balance" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 284,
          columnNumber: 21
        }),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-4xl font-bold text-white pixel-font tracking-tighter", children: userRecord?.balance || 0 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 286,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("span", { className: "text-green-400 font-bold", children: "GTC" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 289,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 285,
          columnNumber: 21
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 283,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 274,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col items-center justify-center p-6 relative", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none", children: /* @__PURE__ */ jsxDEV("img", { src: "grass_icon.png", className: "w-64 h-64 grayscale" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 298,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 297,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => setCameraOpen(true),
          className: "relative group w-48 h-48 rounded-full bg-gradient-to-b from-green-500 to-green-700 shadow-[0_0_40px_rgba(34,197,94,0.3)] active:scale-95 transition-all duration-200 btn-pulse flex flex-col items-center justify-center border-4 border-green-400/30 z-10",
          children: [
            /* @__PURE__ */ jsxDEV("img", { src: "grass_icon.png", className: "w-20 h-20 mb-2 drop-shadow-lg" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 305,
              columnNumber: 21
            }),
            /* @__PURE__ */ jsxDEV("span", { className: "font-bold text-green-50 text-lg uppercase tracking-wide", children: "Verify" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 306,
              columnNumber: 21
            })
          ]
        },
        void 0,
        true,
        {
          fileName: "<stdin>",
          lineNumber: 301,
          columnNumber: 17
        }
      ),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-8 text-center text-gray-400 text-sm max-w-[200px]", children: "Point camera at hand touching real grass to mine currency." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 309,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 295,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "h-1/3 bg-gray-800/50 rounded-t-3xl border-t border-green-900 backdrop-blur-md p-6 flex flex-col", children: [
      /* @__PURE__ */ jsxDEV("h3", { className: "text-xs font-bold text-green-500 uppercase tracking-widest mb-4", children: "Verification Log" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 316,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-y-auto no-scrollbar space-y-3", children: [
        userRecord?.history?.length === 0 && /* @__PURE__ */ jsxDEV("div", { className: "text-gray-500 text-center text-sm py-4 italic", children: "No grass touched yet. Go outside." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 320,
          columnNumber: 25
        }),
        userRecord?.history?.map((entry, idx) => /* @__PURE__ */ jsxDEV("div", { className: "bg-black/30 p-3 rounded-lg border-l-2 border-green-600 flex justify-between items-start", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex-1 mr-2", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-white font-medium truncate", title: entry.hash, children: [
              "HASH: ",
              entry.hash ? entry.hash.substring(0, 20) : "???",
              "..."
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 326,
              columnNumber: 33
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-gray-400 mt-1", children: new Date(entry.timestamp).toLocaleTimeString() }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 329,
              columnNumber: 33
            })
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 325,
            columnNumber: 29
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "text-green-400 font-bold text-xs", children: "+100 GTC" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 333,
            columnNumber: 29
          })
        ] }, idx, true, {
          fileName: "<stdin>",
          lineNumber: 324,
          columnNumber: 25
        }))
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 318,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 315,
      columnNumber: 13
    }),
    cameraOpen && /* @__PURE__ */ jsxDEV(
      CameraView,
      {
        onCapture: handleVerify,
        onCancel: () => setCameraOpen(false)
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 341,
        columnNumber: 17
      }
    ),
    analyzing && /* @__PURE__ */ jsxDEV(AnalyzingView, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 347,
      columnNumber: 27
    }),
    result && /* @__PURE__ */ jsxDEV("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200", children: /* @__PURE__ */ jsxDEV("div", { className: "bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center relative overflow-hidden", children: [
      result.success ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 left-0 w-full h-1 bg-green-500" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 354,
          columnNumber: 33
        }),
        /* @__PURE__ */ jsxDEV("div", { className: "text-5xl mb-4", children: "\u{1F33F}" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 355,
          columnNumber: 33
        }),
        /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-bold text-green-400 mb-2", children: "VERIFIED" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 356,
          columnNumber: 33
        }),
        /* @__PURE__ */ jsxDEV("p", { className: "text-gray-300 text-sm mb-6", children: result.message }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 357,
          columnNumber: 33
        }),
        /* @__PURE__ */ jsxDEV("div", { className: "text-3xl font-bold text-white mb-6 pixel-font", children: [
          "+",
          result.gained,
          " GTC"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 358,
          columnNumber: 33
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 353,
        columnNumber: 29
      }) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 left-0 w-full h-1 bg-red-500" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 362,
          columnNumber: 33
        }),
        /* @__PURE__ */ jsxDEV("div", { className: "text-5xl mb-4", children: "\u{1F6AB}" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 363,
          columnNumber: 33
        }),
        /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-bold text-red-400 mb-2", children: "REJECTED" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 364,
          columnNumber: 33
        }),
        /* @__PURE__ */ jsxDEV("p", { className: "text-gray-300 text-sm mb-6", children: result.message }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 365,
          columnNumber: 33
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 361,
        columnNumber: 29
      }),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => setResult(null),
          className: "w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-colors",
          children: "Close"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 369,
          columnNumber: 25
        }
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 351,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 350,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 272,
    columnNumber: 9
  });
};
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 383,
  columnNumber: 13
}));
