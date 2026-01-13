import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '@/services/api';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

const ContactPage = () => {
    const { t } = useLanguage();
    const { getSetting } = useSettings();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Get form data
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
        };

        try {
            await api.post('/public/contact', data);
            toast.success(t('contact.success'), {
                description: t('contact.success.desc')
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error(error);
            toast.error(t('contact.error'), {
                description: t('contact.error.desc')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            {/* Header */}
            <section className="text-center space-y-4 py-8">
                <h1 className="text-4xl md:text-5xl font-bold text-green-700">{getSetting('CONTACT_TITLE', t('contact.title'))}</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    {getSetting('CONTACT_SUBTITLE', t('contact.subtitle'))}
                </p>
            </section>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-6">
                    {/* Visit Us */}
                    <Card className="hover:shadow-lg transition-shadow border-none shadow-md">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-4">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('contact.info.visitUs')}</h3>
                                <p>{getSetting('COMPANY_LOCATION', 'Kathmandu, Nepal')}</p>
                                <p>{getSetting('COMPANY_TAGLINE', 'Krishi Bazaar HQ')}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Call Us */}
                    <Card className="hover:shadow-lg transition-shadow border-none shadow-md">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('contact.info.callUs')}</h3>
                                <p>{t('contact.info.available')}</p>
                                <a href={`tel:${getSetting('COMPANY_PHONE', '+977-9800000000')}`} className="text-lg font-bold text-green-700 mt-2 hover:underline">
                                    {getSetting('COMPANY_PHONE', '+977-9863249025')}
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Email Us */}
                    <Card className="hover:shadow-lg transition-shadow border-none shadow-md">
                        <CardContent className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('contact.info.emailUs')}</h3>
                                <p>{t('contact.info.response')}</p>
                                <a href={`mailto:${getSetting('COMPANY_EMAIL', 'support@krishibazaar.com')}`} className="text-lg font-bold text-green-700 mt-2 hover:underline">
                                    {getSetting('COMPANY_EMAIL', 'info@kisansarathi.com.np')}
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <Card className="hover:shadow-lg transition-shadow border-green-100">
                    <CardHeader>
                        <CardTitle>{t('contact.form.title')}</CardTitle>
                        <CardDescription>{t('contact.form.subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">{t('contact.form.firstName')}</Label>
                                    <Input id="firstName" name="firstName" placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">{t('contact.form.lastName')}</Label>
                                    <Input id="lastName" name="lastName" placeholder="Doe" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t('contact.form.email')}</Label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                                <Input id="subject" name="subject" placeholder="How can we help?" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">{t('contact.form.message')}</Label>
                                <Textarea id="message" name="message" placeholder="Type your message here..." className="min-h-[120px]" required />
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Map Placeholder */}
            <section className="h-[300px] w-full bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-500">
                <div className="text-center">
                    <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Map Integration Placeholder</p>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
