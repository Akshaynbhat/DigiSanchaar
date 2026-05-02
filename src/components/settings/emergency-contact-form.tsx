
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Trash2, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  phone: z.string().min(10, "Invalid phone number."),
  email: z.string().email("Invalid email address."),
});

type Contact = z.infer<typeof formSchema>;

export function EmergencyContactForm() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<Contact>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (authLoading || !user) return;
    
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
          const data = docSnap.data();
          setContacts(data.emergencyContacts || []);
      }
    }, (error) => {
      console.error("Failed to fetch emergency contacts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch emergency contacts.",
      });
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const saveContacts = async (updatedContacts: Contact[]) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await setDoc(userDocRef, { emergencyContacts: updatedContacts }, { merge: true });
    } catch (error) {
      console.error("Failed to save emergency contacts to Firestore", error);
      toast({
        variant: "destructive",
        title: t('save_failed_title'),
        description: t('could_not_save_emergency_contacts_desc'),
      });
    }
  };

  async function onSubmit(values: Contact) {
    const newContacts = [...contacts, values];
    await saveContacts(newContacts);
    toast({
      title: t('emergency_contact_added_title'),
      description: t('emergency_contact_added_desc', { name: values.name }),
    });
    form.reset();
  }

  async function removeContact(index: number) {
    const contactToRemove = contacts[index];
    const newContacts = contacts.filter((_, i) => i !== index);
    await saveContacts(newContacts);
    toast({
      title: t('contact_removed_title'),
      description: t('contact_removed_desc', { name: contactToRemove.name }),
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg">{t('add_new_contact_title')}</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('full_name_label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('name_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phone_number_label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('phone_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email_address_label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('email_placeholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{t('add_contact_button')}</Button>
              </form>
            </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium font-headline">{t('saved_contacts_title')}</h3>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('no_emergency_contacts_saved_desc')}</p>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone} &bull; {contact.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeContact(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
