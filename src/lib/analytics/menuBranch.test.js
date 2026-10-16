import { describe, it, expect } from "vitest";
import { menuByBranch } from "./menuBranch.js";

const r = (branch, product_id, qty, revenue) => ({ branch, product_id, qty, revenue });

describe("menuByBranch", () => {
  const out = menuByBranch([
    r("สยาม", "P002", 1, 65), r("สยาม", "P001", 2, 110), r("สยาม", "P001", 1, 55),
    r("สีลม", "P001", 4, 220),
  ]);
  it("รวมจำนวนและยอดขายต่อสาขาและเมนู", () => {
    expect(out.find((x) => x.branch === "สยาม" && x.product_id === "P001")).toEqual({ branch: "สยาม", product_id: "P001", qty: 3, revenue: 165 });
    expect(out).toHaveLength(3);
  });
  it("สาขาเดียวกันไม่ปนกับสาขาอื่น", () => {
    expect(out.find((x) => x.branch === "สีลม")).toMatchObject({ qty: 4, revenue: 220 });
  });
});
