import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useContent } from "../../context/ContentContext";

import { useAdmin } from "../../context/AdminContext";

import { saveContentSection } from "../../lib/api";
import { commonActionText } from "../../lib/adminUi";

import {

  getLocationDisplay,

  getServiceArea,

  getSiteLocation,

} from "../../lib/content";

import AdminTopbar from "../../components/admin/AdminTopbar";

import AdminUnsavedGuard from "../../components/admin/AdminUnsavedGuard";

import {

  AdminField,

  AdminFieldGroup,

  AdminInput,

  AdminSaveBar,

  AdminTextarea,

  AdminToggle,

} from "../../components/admin/AdminForm";



const DEFAULTS = {

  location: { cn: "江西南昌", en: "Nanchang, Jiangxi" },

  serviceArea: {

    cn: "常驻江西南昌，可承接 Livehouse、演出系统工程、会议年会、混音后期等项目。",

    en: "Based in Nanchang, available for livehouse, system tuning, corporate events and mixing projects.",

  },

  display: {

    showOnHome: false,

    showOnContact: false,

    showOnFooter: false,

  },

};



export default function AdminLocationPage() {

  const { content, reloadContent } = useContent();

  const { showToast, apiOnline } = useAdmin();



  const [location, setLocation] = useState(DEFAULTS.location);

  const [serviceArea, setServiceArea] = useState(DEFAULTS.serviceArea);

  const [display, setDisplay] = useState(DEFAULTS.display);

  const [baseline, setBaseline] = useState("");

  const [saving, setSaving] = useState(false);



  useEffect(() => {

    if (!content) return;

    const next = {

      location: getSiteLocation(content),

      serviceArea: getServiceArea(content),

      display: getLocationDisplay(content),

    };

    setLocation(next.location);

    setServiceArea(next.serviceArea);

    setDisplay(next.display);

    setBaseline(JSON.stringify(next));

  }, [content]);



  const current = JSON.stringify({ location, serviceArea, display });

  const dirty = baseline && current !== baseline;



  const handleSave = async () => {

    if (apiOnline === false) {

      showToast(commonActionText.apiOffline, "error");

      return;

    }



    setSaving(true);

    try {

      await saveContentSection("location", location);

      await saveContentSection("serviceArea", serviceArea);

      await saveContentSection("display", display);

      await reloadContent();

      setBaseline(current);

      showToast(commonActionText.saved);
    } catch (err) {

      showToast(err.message || commonActionText.saveFailed, "error");

    } finally {

      setSaving(false);

    }

  };



  const handleReset = () => {

    setLocation(DEFAULTS.location);

    setServiceArea(DEFAULTS.serviceArea);

    setDisplay(DEFAULTS.display);

  };



  const handleRestoreSaved = () => {

    if (!content) return;

    setLocation(getSiteLocation(content));

    setServiceArea(getServiceArea(content));

    setDisplay(getLocationDisplay(content));

  };



  return (

    <>

      <AdminTopbar

        eyebrow="常驻地 / 服务范围"

        title="所在地与服务范围"

        description="常驻地 · 服务范围 · 显示路由"

        actions={

          <Link to="/contact" target="_blank" rel="noreferrer" className="admin-btn admin-btn--ghost admin-btn--sm admin-mono">

            预览联系页 ↗

          </Link>

        }

      />

      <AdminUnsavedGuard when={dirty} />



      <AdminFieldGroup eyebrow="常驻地" title="常驻地">

        <div className="admin-form-grid admin-form-grid--bilingual">

          <AdminField label="中文所在地">

            <AdminInput

              value={location.cn ?? ""}

              onChange={(e) => setLocation((prev) => ({ ...prev, cn: e.target.value }))}

            />

          </AdminField>

          <AdminField label="英文所在地">

            <AdminInput

              value={location.en ?? ""}

              onChange={(e) => setLocation((prev) => ({ ...prev, en: e.target.value }))}

            />

          </AdminField>

        </div>

      </AdminFieldGroup>



      <AdminFieldGroup eyebrow="服务范围" title="服务范围说明">

        <div className="admin-form-grid admin-form-grid--bilingual">

          <AdminField label="中文服务范围">

            <AdminTextarea

              rows={4}

              value={serviceArea.cn ?? ""}

              onChange={(e) => setServiceArea((prev) => ({ ...prev, cn: e.target.value }))}

            />

          </AdminField>

          <AdminField label="英文服务范围">

            <AdminTextarea

              rows={4}

              value={serviceArea.en ?? ""}

              onChange={(e) => setServiceArea((prev) => ({ ...prev, en: e.target.value }))}

            />

          </AdminField>

        </div>

      </AdminFieldGroup>



      <AdminFieldGroup eyebrow="显示路由" title="显示路由">

        <div className="admin-routing-list">

          <AdminToggle

            id="display-home"

            checked={display.showOnHome === true}

            onChange={(e) => setDisplay((prev) => ({ ...prev, showOnHome: e.target.checked }))}

            label="显示在首页"

          />

          <AdminToggle

            id="display-contact"

            checked={display.showOnContact === true}

            onChange={(e) => setDisplay((prev) => ({ ...prev, showOnContact: e.target.checked }))}

            label="显示在联系页"

          />

          <AdminToggle

            id="display-footer"

            checked={display.showOnFooter === true}

            onChange={(e) => setDisplay((prev) => ({ ...prev, showOnFooter: e.target.checked }))}

            label="显示在页脚"

          />

        </div>

      </AdminFieldGroup>



      <AdminSaveBar

        saving={saving}

        dirty={dirty}

        onSave={handleSave}

        onReset={handleRestoreSaved}

        saveLabel="保存路由"

      />



      <div className="admin-inline-actions">

        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={handleReset}>

          恢复默认

        </button>

      </div>

    </>

  );

}


