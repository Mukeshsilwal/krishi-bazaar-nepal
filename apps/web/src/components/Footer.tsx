import Logo from "./Logo";
import { Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import api from "../services/api";

const footerLinks = {
  platform: [
    { name: "उब्जनी बेच्नुहोस्", nameEn: "Sell Crops", href: "#" },
    { name: "उब्जनी किन्नुहोस्", nameEn: "Buy Produce", href: "#" },
    { name: "बजार भाउ", nameEn: "Market Prices", href: "#prices" },
    { name: "कृषि पसल", nameEn: "Agri Store", href: "#" },
  ],
  resources: [
    { name: "सिक्ने केन्द्र", nameEn: "Learning Center", href: "#" },
    { name: "खेती क्यालेन्डर", nameEn: "Farming Calendar", href: "#" },
    { name: "मौसम अपडेट", nameEn: "Weather", href: "#" },
    { name: "सोधिने प्रश्नहरू", nameEn: "FAQs", href: "#" },
  ],
  company: [
    { name: "हाम्रो बारेमा", nameEn: "About Us", href: "#about" },
    { name: "सम्पर्क", nameEn: "Contact", href: "#" },
  ],
};

const Footer = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch footer settings", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer id="about" className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="mb-6 [&_span]:text-primary-foreground [&_span.text-primary]:text-secondary">
              <Logo />
            </div>
            <p className="mb-4 text-lg text-primary-foreground/90">
              {settings.COMPANY_TAGLINE || t('footer.tagline')}
            </p>
            <p className="mb-6 max-w-sm text-sm text-primary-foreground/70">
              {t('footer.subtagline')}
            </p>

            {/* Contact Info - Larger touch targets */}
            <div className="space-y-4 text-base text-primary-foreground/70">
              <a href={`tel:${settings.COMPANY_PHONE || '+977-1-4XXXXXX'}`} className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-primary-foreground/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                  <Phone className="h-5 w-5 text-secondary" />
                </div>
                <span>{settings.COMPANY_PHONE || '+977-1-4XXXXXX'}</span>
              </a>
              <a href={`mailto:${settings.COMPANY_EMAIL || 'info@kisansarathi.com.np'}`} className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-primary-foreground/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                  <Mail className="h-5 w-5 text-secondary" />
                </div>
                <span>{settings.COMPANY_EMAIL || 'info@kisansarathi.com.np'}</span>
              </a>
              <div className="flex items-center gap-4 p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
                  <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <span>{settings.COMPANY_LOCATION || 'काठमाडौं, नेपाल'}</span>
              </div>
            </div>

            {/* Social Links - Larger */}
            <div className="mt-6 flex gap-4">
              <a
                href={settings.SOCIAL_FACEBOOK || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-secondary"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href={settings.SOCIAL_YOUTUBE || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-secondary"
                aria-label="YouTube"
              >
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">प्लेटफर्म</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block rounded-lg p-2 text-base text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-secondary"
                  >
                    {language === 'ne' ? link.name : link.nameEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">स्रोतहरू</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block rounded-lg p-2 text-base text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-secondary"
                  >
                    {language === 'ne' ? link.name : link.nameEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-semibold">कम्पनी</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="block rounded-lg p-2 text-base text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-secondary"
                  >
                    {language === 'ne' ? link.name : link.nameEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <p className="text-sm text-primary-foreground/50">
            © २०२४ {settings.COMPANY_NAME || 'किसान सारथी'}। {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/50">
            <a href="/admin/login" className="hover:text-primary-foreground">
              Admin Login
            </a>
            <a href="#" className="hover:text-primary-foreground">
              गोपनीयता नीति
            </a>
            <a href="#" className="hover:text-primary-foreground">
              सेवाका शर्तहरू
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
