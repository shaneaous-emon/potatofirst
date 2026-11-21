import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Field, Select, inputCls, textareaCls } from "@/components/admin/ui";
import { saveProductAction } from "../../_actions/manage";

export type ProductFormData = {
  id?: number;
  name: string;
  nameBn: string;
  subtitle: string;
  shortDescription: string;
  descriptionHtml: string;
  categoryId: number | "";
  status: "draft" | "published" | "archived";
  badgeText: string;
  images: string[];
  variants: { id?: number; label: string; sku: string; price: number | ""; compareAtPrice: number | null; costPrice: number | null; stock: number | "" }[];
};

export const EMPTY_PRODUCT: ProductFormData = {
  name: "",
  nameBn: "",
  subtitle: "",
  shortDescription: "",
  descriptionHtml: "",
  categoryId: "",
  status: "draft",
  badgeText: "",
  images: [],
  variants: [],
};

/** Create / edit form. Variants (sizes or pack options) each have their own SKU, price and stock; blank rows are ignored. */
export function ProductForm({ data, categories }: { data: ProductFormData; categories: { id: number; name: string }[] }) {
  const rows = [...data.variants, ...Array.from({ length: data.variants.length ? 2 : 3 }, () => ({ label: "", sku: "", price: "" as const, compareAtPrice: null, costPrice: null, stock: "" as const }))];
  return (
    <ActionForm action={saveProductAction}>
      {data.id && <input type="hidden" name="id" value={data.id} />}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <Card title="Product details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name *" className="sm:col-span-2">
                <input name="name" required defaultValue={data.name} className={inputCls} />
              </Field>
              <Field label="Name (Bangla)">
                <input name="nameBn" defaultValue={data.nameBn} className={inputCls} />
              </Field>
              <Field label="Subtitle">
                <input name="subtitle" defaultValue={data.subtitle} placeholder="e.g. Crispy & spicy" className={inputCls} />
              </Field>
              <Field label="Short description" className="sm:col-span-2">
                <textarea name="shortDescription" rows={2} defaultValue={data.shortDescription} className={textareaCls} />
              </Field>
              <Field label="Full description (HTML allowed)" className="sm:col-span-2">
                <textarea name="descriptionHtml" rows={6} defaultValue={data.descriptionHtml} className={textareaCls} />
              </Field>
            </div>
          </Card>

          <Card title="Variants, price & stock" actions={<span className="text-[12px] text-ink-muted">Leave extra rows empty</span>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="pb-2 pr-2">Label (size / pack)</th>
                    <th className="pb-2 pr-2">SKU</th>
                    <th className="pb-2 pr-2">Price ৳</th>
                    <th className="pb-2 pr-2">Old price ৳</th>
                    <th className="pb-2 pr-2">Cost ৳</th>
                    <th className="pb-2">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((v, i) => (
                    <tr key={i}>
                      <td className="pb-2 pr-2">
                        <input type="hidden" name="v_id" defaultValue={"id" in v && v.id ? v.id : ""} />
                        <input name="v_label" defaultValue={v.label} placeholder="500g" className={inputCls} />
                      </td>
                      <td className="pb-2 pr-2">
                        <input name="v_sku" defaultValue={v.sku} placeholder="PF-001-500" className={inputCls} />
                      </td>
                      <td className="pb-2 pr-2">
                        <input name="v_price" type="number" min={1} defaultValue={v.price} className={inputCls} />
                      </td>
                      <td className="pb-2 pr-2">
                        <input name="v_compare" type="number" min={0} defaultValue={v.compareAtPrice ?? ""} className={inputCls} />
                      </td>
                      <td className="pb-2 pr-2">
                        <input name="v_cost" type="number" min={0} defaultValue={v.costPrice ?? ""} className={inputCls} />
                      </td>
                      <td className="pb-2">
                        <input name="v_stock" type="number" min={0} defaultValue={v.stock} className={inputCls} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Publish">
            <div className="flex flex-col gap-3">
              <Field label="Status">
                <Select name="status" defaultValue={data.status} className="w-full" options={[{ value: "draft", label: "Draft (hidden)" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} />
              </Field>
              <Field label="Category *">
                <Select name="categoryId" defaultValue={String(data.categoryId)} className="w-full" options={[{ value: "", label: "Choose…" }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]} />
              </Field>
              <Field label="Badge text" hint="e.g. Best Seller, New">
                <input name="badgeText" defaultValue={data.badgeText} className={inputCls} />
              </Field>
              <SubmitButton className="mt-1 w-full">{data.id ? "Save changes" : "Create product"}</SubmitButton>
            </div>
          </Card>
          <Card title="Images">
            <Field label="Image URLs" hint="One per line. First is the main photo. Use /images/… paths or full https:// links.">
              <textarea name="images" rows={5} defaultValue={data.images.join("\n")} className={textareaCls} />
            </Field>
          </Card>
        </div>
      </div>
    </ActionForm>
  );
}
