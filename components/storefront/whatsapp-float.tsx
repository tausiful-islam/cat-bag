import { MessageCircle } from "lucide-react";
import { getWhatsAppSettings } from "@/lib/dal/settings";
import { whatsappLink } from "@/lib/whatsapp";

export async function WhatsAppFloat() {
  const whatsapp = await getWhatsAppSettings();
  if (!whatsapp.number) return null; // hidden until the admin configures a number

  return (
    <a
      href={whatsappLink(whatsapp.number, whatsapp.message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="no-print fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.8} />
    </a>
  );
}
