import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

function joinParagraphs(paragraphs) {
  if (!Array.isArray(paragraphs)) return "";
  return paragraphs
    .map((p) => String(p?.en || "").trim())
    .filter(Boolean)
    .join("\n\n");
}

export default function AdminLibrary() {
  const [tab, setTab] = useState("manage"); // manage | edit
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    seriesTitle: "",
    seriesAuthor: "",
    seriesTagline: "",
    seriesEmoji: "📚",
    seriesAccent: "from-slate-500 via-slate-600 to-slate-700",
    chapterTitle: "",
    chapterLabel: "",
    authorLine: "",
    blurb: "",
    sourceName: "",
    sourceUrl: "",
    sourceLicense: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    chapterTitle: "",
    label: "",
    authorLine: "",
    blurb: "",
  });

  const [editorMode, setEditorMode] = useState("blocks");
  const [blocks, setBlocks] = useState([]);
  const [blockPage, setBlockPage] = useState(0);
  const [rawText, setRawText] = useState("");
  const BLOCKS_PER_PAGE = 50;

  const updateBlock = (index, val) => setBlocks(p => { const n = [...p]; n[index] = val; return n; });
  const deleteBlock = (index) => setBlocks(p => p.filter((_, i) => i !== index));
  const mergeUp = (index) => {
    if (index === 0) return;
    setBlocks(p => { const n = [...p]; n[index - 1] = n[index - 1] + " " + n[index]; n.splice(index, 1); return n; });
  };
  const mergeDown = (index) => {
    if (index === blocks.length - 1) return;
    setBlocks(p => { const n = [...p]; n[index] = n[index] + " " + n[index + 1]; n.splice(index + 1, 1); return n; });
  };
  const cleanupBlocks = () => {
    if (!confirm("Dọn dẹp các dòng trống và dòng chỉ chứa số (thường là số trang)?")) return;
    setBlocks(p => p.filter(b => {
      const t = b.trim();
      if (!t) return false;
      if (/^\d+$/.test(t)) return false;
      return true;
    }));
    setBlockPage(0);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/library/admin/series");
      setSeries(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const chaptersFlat = useMemo(() => {
    const rows = [];
    for (const s of series) {
      for (const ch of s.chapters || []) {
        rows.push({
          seriesTitle: s.displayTitle,
          seriesId: s.id,
          ...ch,
        });
      }
    }
    return rows;
  }, [series]);

  const loadChapterForEdit = async (id) => {
    setEditingId(id);
    setTab("edit");
    setEditLoading(true);
    setErr("");
    try {
      const { data } = await api.get(`/library/chapters/${id}`);
      setEditForm({
        chapterTitle: data.chapterTitle || "",
        label: "",
        authorLine: data.authorLine || "",
        blurb: data.blurb || "",
      });

      const loadedBlocks = (data.paragraphs || []).map((p) => String(p?.en || "").trim()).filter(Boolean);
      setBlocks(loadedBlocks);
      setBlockPage(0);
      setRawText(loadedBlocks.join("\n\n"));
      setEditorMode("blocks");

      // label nằm ở admin list (không có trong reader response)
      const fromList = chaptersFlat.find((x) => String(x.id) === String(id));
      if (fromList?.label) setEditForm((p) => ({ ...p, label: fromList.label }));
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Load chapter failed");
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Chọn file PDF trước đã.");
    if (!form.seriesTitle.trim()) return alert("Nhập tên truyện (Series title).");
    if (!form.chapterTitle.trim()) return alert("Nhập Chapter title.");

    const fd = new FormData();
    fd.append("file", file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));

    setUploading(true);
    setErr("");
    try {
      await api.post("/library/admin/import-pdf", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setForm((p) => ({ ...p, chapterLabel: "", chapterTitle: "" }));
      await fetchAll();
      alert("Import PDF xong. Vào Edit để chỉnh lại đoạn/cắt câu nếu cần.");
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Import failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setEditLoading(true);
    setErr("");
    try {
      const finalBlocks = editorMode === "raw" 
        ? rawText.replace(/\r/g, "").split(/\n\s*\n/g).map(x => x.trim().replace(/\n+/g, " ").replace(/\s{2,}/g, " ").trim()).filter(Boolean)
        : blocks;

      await api.patch(`/library/admin/chapters/${editingId}`, {
        chapterTitle: editForm.chapterTitle,
        label: editForm.label,
        authorLine: editForm.authorLine,
        blurb: editForm.blurb,
        paragraphsText: finalBlocks.join("\n\n"),
      });
      await fetchAll();
      alert("Đã lưu.");
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Save failed");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa chapter này?")) return;
    setErr("");
    try {
      await api.delete(`/library/admin/chapters/${id}`);
      if (editingId === id) setEditingId(null);
      await fetchAll();
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Delete failed");
    }
  };

  return (
    <div className="animate-fade-rise space-y-6 pb-10">
      <header className="surface-panel p-6 md:p-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)] md:text-3xl">
          Admin · Library (PDF Import)
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--text-soft)] md:text-[15px]">
          Upload PDF (text-based) → hệ thống trích xuất thành paragraphs → bạn chỉnh lại trong editor (không làm UX nặng).
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("manage")}
          className={`glass-btn h-10 px-4 text-sm font-bold ${
            tab === "manage" ? "border-[color-mix(in_srgb,var(--primary)_35%,transparent)]" : ""
          }`}
        >
          Quản lý / Import
        </button>
        <button
          type="button"
          onClick={() => {
            if (!editingId) {
              alert("Chọn 1 chapter để Edit trước.");
              return;
            }
            setTab("edit");
          }}
          className={`glass-btn h-10 px-4 text-sm font-bold ${
            tab === "edit" ? "border-[color-mix(in_srgb,var(--primary)_35%,transparent)]" : ""
          }`}
        >
          Edit
        </button>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-400/30 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-5 py-3 text-sm text-red-800 dark:text-red-100">
          {err}
        </div>
      ) : null}

      {tab === "manage" ? (
        <>
          <section className="surface-panel p-6 md:p-8">
            <h2 className="font-display text-lg font-extrabold text-[var(--text)]">Import PDF</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                className="input-magic"
                placeholder="Series title (tên truyện)"
                value={form.seriesTitle}
                onChange={(e) => setForm((p) => ({ ...p, seriesTitle: e.target.value }))}
              />
              <input
                className="input-magic"
                placeholder="Series author"
                value={form.seriesAuthor}
                onChange={(e) => setForm((p) => ({ ...p, seriesAuthor: e.target.value }))}
              />
              <input
                className="input-magic"
                placeholder="Tagline"
                value={form.seriesTagline}
                onChange={(e) => setForm((p) => ({ ...p, seriesTagline: e.target.value }))}
              />
              <input
                className="input-magic"
                placeholder="Cover emoji (vd: 📖)"
                value={form.seriesEmoji}
                onChange={(e) => setForm((p) => ({ ...p, seriesEmoji: e.target.value }))}
              />
              <input
                className="input-magic md:col-span-2"
                placeholder="Accent class (tailwind gradient) — tuỳ chọn"
                value={form.seriesAccent}
                onChange={(e) => setForm((p) => ({ ...p, seriesAccent: e.target.value }))}
              />

              <input
                className="input-magic"
                placeholder="Chapter title"
                value={form.chapterTitle}
                onChange={(e) => setForm((p) => ({ ...p, chapterTitle: e.target.value }))}
              />
              <input
                className="input-magic"
                placeholder="Chapter label (hiển thị nút)"
                value={form.chapterLabel}
                onChange={(e) => setForm((p) => ({ ...p, chapterLabel: e.target.value }))}
              />

              <input
                className="input-magic"
                placeholder="Author line (tuỳ chọn)"
                value={form.authorLine}
                onChange={(e) => setForm((p) => ({ ...p, authorLine: e.target.value }))}
              />
              <input
                className="input-magic"
                placeholder="Blurb (tuỳ chọn)"
                value={form.blurb}
                onChange={(e) => setForm((p) => ({ ...p, blurb: e.target.value }))}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                className="input-magic"
                placeholder="Source name (tuỳ chọn)"
                value={form.sourceName}
                onChange={(e) => setForm((p) => ({ ...p, sourceName: e.target.value }))}
              />
              <input
                className="input-magic"
                placeholder="Source url"
                value={form.sourceUrl}
                onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))}
              />
              <input
                className="input-magic"
                placeholder="License"
                value={form.sourceLicense}
                onChange={(e) => setForm((p) => ({ ...p, sourceLicense: e.target.value }))}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-[var(--text-soft)] file:mr-4 file:rounded-2xl file:border file:border-[var(--border)] file:bg-[var(--bg-card)] file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-[var(--text)]"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={handleUpload}
                className="btn-primary-glow shrink-0 rounded-2xl px-6 py-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-45"
              >
                {uploading ? "Đang import…" : "Import PDF"}
              </button>
            </div>
          </section>

          <section className="surface-panel p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold text-[var(--text)]">Danh sách chapters</h2>
              <button
                type="button"
                onClick={fetchAll}
                className="glass-btn h-10 px-4 text-sm font-bold text-[var(--text)]"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="mt-4 text-sm text-[var(--text-soft)]">Đang tải…</div>
            ) : chaptersFlat.length ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {chaptersFlat.map((ch) => (
                  <div
                    key={ch.id}
                    className={`rounded-2xl border bg-[var(--bg-card)] p-4 ${
                      String(editingId) === String(ch.id)
                        ? "border-[color-mix(in_srgb,var(--primary)_40%,var(--border))]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">
                      {ch.seriesTitle}
                    </div>
                    <div className="mt-1 font-display text-base font-extrabold text-[var(--text)]">
                      {ch.chapterTitle}
                    </div>
                    <div className="mt-1 text-sm text-[var(--text-soft)]">{ch.label}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadChapterForEdit(ch.id)}
                        className="glass-btn h-10 px-4 text-sm font-bold text-[var(--text)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ch.id)}
                        className="glass-btn h-10 px-4 text-sm font-bold text-red-600 dark:text-red-300"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-sm text-[var(--text-soft)]">Chưa có chapter nào.</div>
            )}
          </section>
        </>
      ) : (
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-extrabold text-[var(--text)]">Editor</h2>
              <p className="mt-1 text-xs font-semibold text-[var(--text-soft)]">
                Tip: mỗi đoạn cách nhau 1 dòng trống.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTab("manage")}
                className="glass-btn h-10 px-4 text-sm font-bold text-[var(--text)]"
              >
                ← Quay lại
              </button>
            </div>
          </div>

          {!editingId ? (
            <div className="mt-4 text-sm text-[var(--text-soft)]">
              Chưa chọn chapter. Quay lại tab Quản lý để chọn.
            </div>
          ) : editLoading ? (
            <div className="mt-4 text-sm text-[var(--text-soft)]">Đang tải…</div>
          ) : (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <input
                  className="input-magic"
                  placeholder="Chapter title"
                  value={editForm.chapterTitle}
                  onChange={(e) => setEditForm((p) => ({ ...p, chapterTitle: e.target.value }))}
                />
                <input
                  className="input-magic"
                  placeholder="Label"
                  value={editForm.label}
                  onChange={(e) => setEditForm((p) => ({ ...p, label: e.target.value }))}
                />
                <input
                  className="input-magic"
                  placeholder="Author line"
                  value={editForm.authorLine}
                  onChange={(e) => setEditForm((p) => ({ ...p, authorLine: e.target.value }))}
                />
                <input
                  className="input-magic"
                  placeholder="Blurb"
                  value={editForm.blurb}
                  onChange={(e) => setEditForm((p) => ({ ...p, blurb: e.target.value }))}
                />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editorMode === "raw") {
                        const newBlocks = rawText.replace(/\r/g, "").split(/\n\s*\n/g).map(x => x.trim()).filter(Boolean);
                        setBlocks(newBlocks);
                        setBlockPage(0);
                        setEditorMode("blocks");
                      }
                    }}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${editorMode === "blocks" ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "text-[var(--text-soft)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]"}`}
                  >
                    Block Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editorMode === "blocks") {
                        setRawText(blocks.join("\n\n"));
                        setEditorMode("raw");
                      }
                    }}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${editorMode === "raw" ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20" : "text-[var(--text-soft)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]"}`}
                  >
                    Raw Text
                  </button>
                </div>
                
                {editorMode === "blocks" && (
                  <button
                    type="button"
                    onClick={cleanupBlocks}
                    className="glass-btn h-9 px-4 text-xs font-bold text-amber-500"
                  >
                    ✨ Dọn dẹp số trang & dòng trống
                  </button>
                )}
              </div>

              <div className="mt-4">
                {editorMode === "raw" ? (
                  <textarea
                    className="textarea-analyzer mt-2 w-full min-h-[70vh] font-mono text-sm leading-relaxed"
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Mỗi đoạn cách nhau 1 dòng trống..."
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                      <div className="text-sm font-bold text-[var(--text-soft)]">
                        Tổng cộng {blocks.length} blocks
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={blockPage === 0}
                          onClick={() => setBlockPage(p => Math.max(0, p - 1))}
                          className="glass-btn h-8 px-3 text-sm disabled:opacity-30"
                        >
                          Trang trước
                        </button>
                        <span className="text-sm font-bold text-[var(--text)]">
                          {blockPage + 1} / {Math.max(1, Math.ceil(blocks.length / BLOCKS_PER_PAGE))}
                        </span>
                        <button
                          type="button"
                          disabled={blockPage >= Math.ceil(blocks.length / BLOCKS_PER_PAGE) - 1}
                          onClick={() => setBlockPage(p => p + 1)}
                          className="glass-btn h-8 px-3 text-sm disabled:opacity-30"
                        >
                          Trang sau
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {blocks.slice(blockPage * BLOCKS_PER_PAGE, (blockPage + 1) * BLOCKS_PER_PAGE).map((block, i) => {
                        const actualIndex = blockPage * BLOCKS_PER_PAGE + i;
                        return (
                          <div key={actualIndex} className="group relative flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-3 transition-colors hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--border))]">
                            <div className="flex w-10 shrink-0 flex-col items-center gap-1 border-r border-[var(--border)] pr-2">
                              <span className="text-xs font-bold text-[var(--text-soft)] opacity-60">{actualIndex + 1}</span>
                              <div className="mt-auto flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button type="button" onClick={() => mergeUp(actualIndex)} title="Merge Up" className="flex h-6 w-6 items-center justify-center rounded bg-gray-500/10 text-[10px] hover:bg-[var(--primary)] hover:text-white">↑</button>
                                <button type="button" onClick={() => mergeDown(actualIndex)} title="Merge Down" className="flex h-6 w-6 items-center justify-center rounded bg-gray-500/10 text-[10px] hover:bg-[var(--primary)] hover:text-white">↓</button>
                                <button type="button" onClick={() => deleteBlock(actualIndex)} title="Delete Block" className="flex h-6 w-6 items-center justify-center rounded bg-red-500/10 text-[10px] text-red-500 hover:bg-red-500 hover:text-white">✕</button>
                              </div>
                            </div>
                            <textarea
                              className="w-full resize-y bg-transparent text-[15px] leading-relaxed text-[var(--text)] outline-none"
                              rows={Math.max(2, block.split('\n').length)}
                              value={block}
                              onChange={(e) => updateBlock(actualIndex, e.target.value)}
                            />
                          </div>
                        );
                      })}
                      {blocks.length === 0 && (
                        <div className="p-8 text-center text-[var(--text-soft)]">Không có nội dung.</div>
                      )}
                    </div>
                    
                    {blocks.length > BLOCKS_PER_PAGE && (
                      <div className="mt-4 flex justify-center gap-2">
                        <button
                          type="button"
                          disabled={blockPage === 0}
                          onClick={() => { setBlockPage(p => Math.max(0, p - 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                          className="glass-btn h-10 px-4 text-sm font-bold disabled:opacity-30"
                        >
                          Trang trước
                        </button>
                        <button
                          type="button"
                          disabled={blockPage >= Math.ceil(blocks.length / BLOCKS_PER_PAGE) - 1}
                          onClick={() => { setBlockPage(p => p + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                          className="glass-btn h-10 px-4 text-sm font-bold disabled:opacity-30"
                        >
                          Trang sau
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sticky bottom-4 mt-8 flex justify-end">
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={handleSaveEdit}
                  className="btn-primary-glow rounded-2xl px-8 py-3.5 text-base font-extrabold shadow-lg disabled:pointer-events-none disabled:opacity-45"
                >
                  {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
