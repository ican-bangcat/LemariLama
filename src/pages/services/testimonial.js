// services/testimonial.js
import { supabase } from '../lib/supabase';
// Mendapatkan semua testimonial
export async function getTestimonials() {
  const { data, error } = await supabase
    .from("testimonial")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// 🛠 Inilah fungsi yang error-nya tadi
export async function deleteTestimonial(id) {
  const { error } = await supabase
    .from("testimonial")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function addTestimonial(data) {
  const { error } = await supabase.from("testimonial").insert([data]);
  if (error) throw error;
}

export const updateTestimonial = async (id, formData) => {
  console.log("UPDATE TESTIMONIAL", { id, formData });

  const { error } = await supabase
    .from("testimonial")
    .update({
      name: formData.name,
      text: formData.text,
      rating: Number(formData.rating),
    })
    .eq("id", id);

  if (error) {
    console.error("❌ Supabase error:", error.message);
    throw new Error(error.message);
  }
};


