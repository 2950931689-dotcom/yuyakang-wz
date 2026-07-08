import { useCallback, useEffect, useState } from "react";
import { useContent } from "../context/ContentContext";
import { useAdmin } from "../context/AdminContext";
import { saveContentSection, AuthRequiredError } from "../lib/api";
import { commonActionText } from "../lib/adminUi";

export function useSectionEditor(sectionKey, getInitial, { validate } = {}) {
  const { content, reloadContent } = useContent();
  const { showToast, apiOnline } = useAdmin();
  const [data, setData] = useState(null);
  const [baseline, setBaseline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!content) return;
    const initial = getInitial(content);
    const cloned = JSON.parse(JSON.stringify(initial));
    setData(cloned);
    setBaseline(JSON.stringify(cloned));
  }, [content, getInitial]);

  const dirty = data != null && baseline && JSON.stringify(data) !== baseline;

  const update = useCallback((patchOrFn) => {
    setData((prev) => {
      if (typeof patchOrFn === "function") return patchOrFn(prev);
      return { ...prev, ...patchOrFn };
    });
  }, []);

  const reset = useCallback(() => {
    if (!content) return;
    const initial = getInitial(content);
    const cloned = JSON.parse(JSON.stringify(initial));
    setData(cloned);
    setBaseline(JSON.stringify(cloned));
  }, [content, getInitial]);

  const save = useCallback(async () => {
    if (data == null || apiOnline === false) {
      showToast(commonActionText.apiOffline, "error");
      return false;
    }
    if (validate) {
      const result = validate(data);
      if (!result.ok) {
        showToast(result.error || commonActionText.validateFailed, "error");
        return false;
      }
    }
    setSaving(true);
    try {
      await saveContentSection(sectionKey, data);
      await reloadContent();
      setBaseline(JSON.stringify(data));
      showToast(commonActionText.saved);
      return true;
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        showToast("登录已过期，请重新登录", "error");
        window.location.assign("/admin/login");
        return false;
      }
      showToast(err.message || commonActionText.saveFailed, "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [apiOnline, data, reloadContent, sectionKey, showToast, validate]);

  return { data, setData, update, dirty, saving, save, reset, loading: !content || data == null };
}

export function useArraySectionEditor(sectionKey, getInitialArray, { validateItem } = {}) {
  const editor = useSectionEditor(sectionKey, getInitialArray);

  const updateItem = useCallback((index, patch) => {
    editor.setData((prev) => {
      const list = [...(prev ?? [])];
      list[index] = { ...list[index], ...patch };
      return list;
    });
  }, [editor]);

  const addItem = useCallback((item) => {
    editor.setData((prev) => [...(prev ?? []), item]);
  }, [editor]);

  const removeItem = useCallback((index) => {
    editor.setData((prev) => {
      const list = [...(prev ?? [])];
      list.splice(index, 1);
      return list;
    });
  }, [editor]);

  const moveItem = useCallback((index, direction) => {
    editor.setData((prev) => {
      const list = [...(prev ?? [])];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      return list.map((item, i) => ({ ...item, sortOrder: i + 1, order: i + 1 }));
    });
  }, [editor]);

  const duplicateItem = useCallback((index, mutate) => {
    editor.setData((prev) => {
      const list = [...(prev ?? [])];
      const copy = JSON.parse(JSON.stringify(list[index]));
      if (mutate) mutate(copy);
      list.splice(index + 1, 0, copy);
      return list;
    });
  }, [editor]);

  return { ...editor, updateItem, addItem, removeItem, moveItem, duplicateItem, validateItem };
}
