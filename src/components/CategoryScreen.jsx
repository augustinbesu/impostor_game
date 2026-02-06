import { useState, useMemo } from "react";
import { useGame, PHASES } from "../context/GameContext";
import {
  getBuiltInCategories, getCustomCategoryNames, getCategoryPairs,
  isBuiltIn, addCustomCategory, updateCustomCategory,
  deleteCustomCategory, addPairsToBuiltIn, loadCustomCategories,
} from "../data/wordPacks";
import { t, getCategoryDisplayName } from "../data/i18n";
import {
  IconChevronLeft, IconCheck, IconPlus, IconMinus, IconTrash,
  IconEdit, IconSearch, IconFolder, IconX, IconGrid,
} from "./Icons";
import { playTap, haptic } from "../utils/sounds";

/**
 * CategoryScreen  Full-screen category browser.
 * Browse built-in & custom categories, select for gameplay,
 * create new custom categories, add pairs to existing ones.
 */
export default function CategoryScreen() {
  const { state, actions } = useGame();
  const lang = state.language;

  const [tab, setTab] = useState("builtin"); // "builtin" | "custom"
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null); // category name being edited
  const [addingTo, setAddingTo] = useState(null); // adding pairs to existing category
  const [preview, setPreview] = useState(null); // category name for preview
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Category creation/editing form
  const [formName, setFormName] = useState("");
  const [formPairs, setFormPairs] = useState([["", ""], ["", ""], ["", ""]]);
  const [formError, setFormError] = useState("");

  // Adding pairs form
  const [addPairs, setAddPairs] = useState([["", ""]]);

  // Refresh trigger for custom categories
  const [refreshKey, setRefreshKey] = useState(0);

  const builtInCats = getBuiltInCategories();
  const customCats = useMemo(() => getCustomCategoryNames(), [refreshKey]);

  const displayCats = tab === "builtin" ? builtInCats : customCats;
  const filtered = displayCats.filter(c =>
    getCategoryDisplayName(lang, c).toLowerCase().includes(search.toLowerCase())
  );

  const selected = state.selectedCategories;
  const selCount = selected.length;

  function toggleSel(cat) {
    actions.toggleCategory(cat);
    if (state.soundEnabled) { playTap(); haptic("light"); }
  }

  function goBack() {
    if (state.soundEnabled) playTap();
    actions.setPhase(PHASES.SETUP);
  }

  function selectAll() {
    const cats = [...new Set([...selected, ...filtered])];
    actions.setSelectedCategories(cats);
    if (state.soundEnabled) playTap();
  }

  function deselectAll() {
    const remaining = selected.filter(c => !filtered.includes(c));
    actions.setSelectedCategories(remaining);
    if (state.soundEnabled) playTap();
  }

  // +++ Create / Edit custom category +++
  function openCreate() {
    setFormName("");
    setFormPairs([["", ""], ["", ""], ["", ""]]);
    setFormError("");
    setCreating(true);
    if (state.soundEnabled) playTap();
  }

  function openEdit(catName) {
    const pairs = getCategoryPairs(catName);
    setFormName(catName);
    setFormPairs(pairs.map(p => [...p]));
    setFormError("");
    setEditing(catName);
    if (state.soundEnabled) playTap();
  }

  function addFormPair() {
    setFormPairs([...formPairs, ["", ""]]);
  }

  function removeFormPair(idx) {
    if (formPairs.length <= 3) return;
    setFormPairs(formPairs.filter((_, i) => i !== idx));
  }

  function updateFormPair(idx, wordIdx, val) {
    const next = formPairs.map((p, i) => i === idx ? (wordIdx === 0 ? [val, p[1]] : [p[0], val]) : p);
    setFormPairs(next);
  }

  function saveForm() {
    const name = formName.trim();
    if (!name) { setFormError(t(lang, "nameRequired")); return; }

    const validPairs = formPairs.filter(p => p[0].trim() && p[1].trim());
    if (validPairs.length < 3) { setFormError(t(lang, "minPairs")); return; }

    const allCats = [...builtInCats, ...getCustomCategoryNames()];

    if (creating) {
      if (allCats.includes(name)) { setFormError(t(lang, "nameTaken")); return; }
      addCustomCategory(name, validPairs.map(p => [p[0].trim(), p[1].trim()]));
      // Auto-select new category
      if (!selected.includes(name)) actions.toggleCategory(name);
    } else if (editing) {
      updateCustomCategory(editing, validPairs.map(p => [p[0].trim(), p[1].trim()]));
    }

    setCreating(false);
    setEditing(null);
    setFormError("");
    setRefreshKey(k => k + 1);
    if (state.soundEnabled) { playTap(); haptic("medium"); }
  }

  function cancelForm() {
    setCreating(false);
    setEditing(null);
    setFormError("");
    if (state.soundEnabled) playTap();
  }

  // +++ Delete category +++
  function handleDelete(catName) {
    deleteCustomCategory(catName);
    // Remove from selected
    const next = selected.filter(c => c !== catName);
    actions.setSelectedCategories(next);
    setConfirmDelete(null);
    setRefreshKey(k => k + 1);
    if (state.soundEnabled) { playTap(); haptic("medium"); }
  }

  // +++ Add pairs to existing +++
  function openAddPairs(catName) {
    setAddPairs([["", ""]]);
    setAddingTo(catName);
    if (state.soundEnabled) playTap();
  }

  function saveAddPairs() {
    const valid = addPairs.filter(p => p[0].trim() && p[1].trim());
    if (!valid.length) return;

    if (isBuiltIn(addingTo)) {
      addPairsToBuiltIn(addingTo, valid.map(p => [p[0].trim(), p[1].trim()]));
    } else {
      const existing = getCategoryPairs(addingTo);
      updateCustomCategory(addingTo, [...existing, ...valid.map(p => [p[0].trim(), p[1].trim()])]);
    }
    setAddingTo(null);
    setRefreshKey(k => k + 1);
    if (state.soundEnabled) { playTap(); haptic("medium"); }
  }

  // +++ Render: Form (create / edit) +++
  if (creating || editing) {
    return (
      <div className="screen category-screen">
        <div className="cat-header">
          <button className="icon-btn" onClick={cancelForm}><IconChevronLeft size={20} /></button>
          <h2 className="cat-title">{creating ? t(lang, "createCategory") : t(lang, "editCategory")}</h2>
          <div style={{ width: 40 }} />
        </div>

        <div className="cat-form">
          <div className="custom-input-group">
            <label className="custom-label">{t(lang, "categoryName")}</label>
            <input
              type="text" className="custom-input"
              placeholder={t(lang, "categoryNamePlaceholder")}
              value={formName} onChange={e => setFormName(e.target.value)}
              maxLength={30} disabled={!!editing}
            />
          </div>

          <div className="form-pairs-header">
            <span className="custom-label">{t(lang, "word1")} / {t(lang, "word2")}</span>
            <button className="btn-ghost btn-sm" onClick={addFormPair}>
              <IconPlus size={14} /> {t(lang, "addPair")}
            </button>
          </div>

          <div className="form-pairs-list">
            {formPairs.map((pair, idx) => (
              <div className="form-pair-row" key={idx}>
                <input
                  type="text" className="custom-input pair-input"
                  placeholder={t(lang, "word1Placeholder")}
                  value={pair[0]} onChange={e => updateFormPair(idx, 0, e.target.value)}
                  maxLength={30}
                />
                <input
                  type="text" className="custom-input pair-input"
                  placeholder={t(lang, "word2Placeholder")}
                  value={pair[1]} onChange={e => updateFormPair(idx, 1, e.target.value)}
                  maxLength={30}
                />
                <button
                  className="icon-btn-sm" onClick={() => removeFormPair(idx)}
                  disabled={formPairs.length <= 3}
                >
                  <IconMinus size={14} />
                </button>
              </div>
            ))}
          </div>

          {formError && <div className="validation-error">{formError}</div>}

          <div className="form-actions">
            <button className="btn-primary" onClick={saveForm}>
              <IconCheck size={18} /> <span>{t(lang, "save")}</span>
            </button>
            <button className="btn-ghost" onClick={cancelForm}>{t(lang, "cancel")}</button>
          </div>
        </div>
      </div>
    );
  }

  // +++ Render: Add pairs to existing +++
  if (addingTo) {
    return (
      <div className="screen category-screen">
        <div className="cat-header">
          <button className="icon-btn" onClick={() => setAddingTo(null)}><IconChevronLeft size={20} /></button>
          <h2 className="cat-title">{t(lang, "addToCategory")}: {getCategoryDisplayName(lang, addingTo)}</h2>
          <div style={{ width: 40 }} />
        </div>

        <div className="cat-form">
          <div className="form-pairs-header">
            <span className="custom-label">{t(lang, "word1")} / {t(lang, "word2")}</span>
            <button className="btn-ghost btn-sm" onClick={() => setAddPairs([...addPairs, ["", ""]])}>
              <IconPlus size={14} /> {t(lang, "addPair")}
            </button>
          </div>

          <div className="form-pairs-list">
            {addPairs.map((pair, idx) => (
              <div className="form-pair-row" key={idx}>
                <input type="text" className="custom-input pair-input" placeholder={t(lang, "word1Placeholder")}
                  value={pair[0]} onChange={e => {
                    const n = [...addPairs]; n[idx] = [e.target.value, pair[1]]; setAddPairs(n);
                  }} maxLength={30}
                />
                <input type="text" className="custom-input pair-input" placeholder={t(lang, "word2Placeholder")}
                  value={pair[1]} onChange={e => {
                    const n = [...addPairs]; n[idx] = [pair[0], e.target.value]; setAddPairs(n);
                  }} maxLength={30}
                />
                {addPairs.length > 1 && (
                  <button className="icon-btn-sm" onClick={() => setAddPairs(addPairs.filter((_, i) => i !== idx))}>
                    <IconMinus size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={saveAddPairs}>
              <IconCheck size={18} /> <span>{t(lang, "save")}</span>
            </button>
            <button className="btn-ghost" onClick={() => setAddingTo(null)}>{t(lang, "cancel")}</button>
          </div>
        </div>
      </div>
    );
  }

  // +++ Render: Preview +++
  if (preview) {
    const pairs = getCategoryPairs(preview);
    return (
      <div className="screen category-screen">
        <div className="cat-header">
          <button className="icon-btn" onClick={() => setPreview(null)}><IconChevronLeft size={20} /></button>
          <h2 className="cat-title">{getCategoryDisplayName(lang, preview)}</h2>
          <div style={{ width: 40 }} />
        </div>
        <p className="cat-subtitle">{t(lang, "pairsCount", { n: pairs.length })}</p>

        <div className="preview-pairs">
          {pairs.map((p, i) => (
            <div className="preview-pair" key={i}>
              <span>{p[0]}</span>
              <span className="preview-vs">vs</span>
              <span>{p[1]}</span>
            </div>
          ))}
        </div>

        <div className="preview-actions">
          <button className="btn-primary" onClick={() => { toggleSel(preview); setPreview(null); }}>
            {selected.includes(preview)
              ? <><IconX size={16} /> <span>{t(lang, "deselectAll")}</span></>
              : <><IconCheck size={16} /> <span>{t(lang, "selectCategories")}</span></>
            }
          </button>
          <button className="btn-ghost" onClick={() => { openAddPairs(preview); setPreview(null); }}>
            <IconPlus size={16} /> {t(lang, "addPair")}
          </button>
        </div>
      </div>
    );
  }

  // +++ Render: Delete confirm +++
  if (confirmDelete) {
    return (
      <div className="screen category-screen">
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-card">
            <IconTrash size={32} className="delete-icon" />
            <h3>{t(lang, "deleteConfirm")}</h3>
            <p>{t(lang, "deleteConfirmText")}</p>
            <div className="delete-confirm-actions">
              <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>
                <IconTrash size={16} /> {t(lang, "yes")}
              </button>
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>{t(lang, "no")}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // +++ Render: Main browse +++
  return (
    <div className="screen category-screen">
      <div className="cat-header">
        <button className="icon-btn" onClick={goBack}><IconChevronLeft size={20} /></button>
        <h2 className="cat-title">{t(lang, "categoriesTitle")}</h2>
        <div style={{ width: 40 }} />
      </div>
      <p className="cat-subtitle">{t(lang, "categoriesSubtitle")}</p>

      {/* Search */}
      <div className="cat-search">
        <IconSearch size={16} className="search-icon" />
        <input
          type="text" className="search-input"
          placeholder={t(lang, "searchCategories")}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch("")}><IconX size={14} /></button>
        )}
      </div>

      {/* Tabs */}
      <div className="cat-tabs">
        <button className={`cat-tab ${tab === "builtin" ? "active" : ""}`} onClick={() => { setTab("builtin"); if (state.soundEnabled) playTap(); }}>
          <IconGrid size={15} /> {t(lang, "builtIn")} ({builtInCats.length})
        </button>
        <button className={`cat-tab ${tab === "custom" ? "active" : ""}`} onClick={() => { setTab("custom"); if (state.soundEnabled) playTap(); }}>
          <IconFolder size={15} /> {t(lang, "custom")} ({customCats.length})
        </button>
      </div>

      {/* Select/deselect all */}
      {filtered.length > 0 && (
        <div className="cat-bulk-actions">
          <button className="btn-ghost btn-sm" onClick={selectAll}>{t(lang, "selectAll")}</button>
          <button className="btn-ghost btn-sm" onClick={deselectAll}>{t(lang, "deselectAll")}</button>
        </div>
      )}

      {/* Category list */}
      <div className="cat-list">
        {filtered.map(cat => {
          const pairs = getCategoryPairs(cat);
          const isSel = selected.includes(cat);
          const isCustom = !isBuiltIn(cat);

          return (
            <div className={`cat-card ${isSel ? "selected" : ""}`} key={cat}>
              <button className="cat-card-main" onClick={() => toggleSel(cat)}>
                <div className={`cat-card-check ${isSel ? "checked" : ""}`}>
                  {isSel && <IconCheck size={14} />}
                </div>
                <div className="cat-card-info">
                  <span className="cat-card-name">{getCategoryDisplayName(lang, cat)}</span>
                  <span className="cat-card-count">{t(lang, "pairsCount", { n: pairs.length })}</span>
                </div>
              </button>
              <div className="cat-card-actions">
                <button className="icon-btn-sm" onClick={() => setPreview(cat)} title={t(lang, "wordsPreview")}>
                  <IconGrid size={14} />
                </button>
                <button className="icon-btn-sm" onClick={() => openAddPairs(cat)} title={t(lang, "addPair")}>
                  <IconPlus size={14} />
                </button>
                {isCustom && (
                  <>
                    <button className="icon-btn-sm" onClick={() => openEdit(cat)} title={t(lang, "edit")}>
                      <IconEdit size={14} />
                    </button>
                    <button className="icon-btn-sm danger" onClick={() => setConfirmDelete(cat)} title={t(lang, "delete")}>
                      <IconTrash size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {tab === "custom" && customCats.length === 0 && (
          <div className="cat-empty">
            <IconFolder size={40} className="cat-empty-icon" />
            <p>{t(lang, "noCustomCategories")}</p>
            <p className="cat-empty-sub">{t(lang, "createFirstCategory")}</p>
          </div>
        )}

        {filtered.length === 0 && (tab === "builtin" || customCats.length > 0) && search && (
          <div className="cat-empty">
            <IconSearch size={40} className="cat-empty-icon" />
            <p>No results for &quot;{search}&quot;</p>
          </div>
        )}
      </div>

      {/* Create button (only on custom tab) */}
      {tab === "custom" && (
        <button className="btn-primary cat-create-btn" onClick={openCreate}>
          <IconPlus size={18} /> <span>{t(lang, "createCategory")}</span>
        </button>
      )}

      {/* Done button */}
      <button className="btn-secondary cat-done-btn" onClick={goBack}>
        <IconCheck size={18} /> <span>{t(lang, "done")} ({selCount})</span>
      </button>
    </div>
  );
}
