"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// Studio data appears on these public pages.
const studioPaths = ["/", "/studio", "/kontakt", "/impressum", "/admin/studios"];

function revalidateStudios() {
  for (const path of studioPaths) revalidatePath(path);
}

async function requireAdmin() {
  const adminId = await getAdminSession();
  if (!adminId) throw new Error("Nicht autorisiert.");
}

function readStudioForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    street: String(formData.get("street") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    mapEmbedUrl: String(formData.get("mapEmbedUrl") ?? "").trim(),
    openingHours: String(formData.get("openingHours") ?? "").trim(),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

export async function createStudio(formData: FormData) {
  await requireAdmin();

  const data = readStudioForm(formData);
  if (!data.name || !data.street || !data.postalCode || !data.city) return;

  const last = await prisma.studioLocation.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.studioLocation.create({
    data: { ...data, sortOrder: data.sortOrder || (last?.sortOrder ?? 0) + 10 },
  });
  revalidateStudios();
}

export async function updateStudio(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const data = readStudioForm(formData);
  if (!id || !data.name || !data.street || !data.postalCode || !data.city) return;

  await prisma.studioLocation.update({ where: { id }, data });
  revalidateStudios();
}

export async function deleteStudio(id: string) {
  await requireAdmin();

  await prisma.studioLocation.delete({ where: { id } });
  revalidateStudios();
}
