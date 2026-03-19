"use client";

import { useEffect, useMemo, useState } from 'react';
import { parseJsonSettings } from '@/lib/utils/settings';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useAccount } from '@/contexts/AccountContext';
import { useLanguageSwitcher } from '@/hooks/useLanguageSwitcher';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { User, Loader2, Database, Users, Globe } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { toast } from 'sonner';
import { DataCleanupTab } from '@/components/settings/DataCleanupTab';
import { MappingHub } from '@/components/settings/MappingHub';

const t = (key: string, params?: Record<string, any>) => key;

export default function SettingsPage() {
  const { currentLanguage, changeLanguage } = useLanguageSwitcher();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { mutateAsync: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { currentAccount, currentRole, refreshAccounts } = useAccount();
  const canManageData = currentRole === 'owner' || currentRole === 'admin';

  const [fullName, setFullName] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notifyOnErrors, setNotifyOnErrors] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const accountSettings = useMemo<Record<string, unknown>>(() => {
    return parseJsonSettings(currentAccount?.settings) ?? {};
  }, [currentAccount?.settings]);

  useEffect(() => {
    if (!currentAccount) {
      setNotificationEmail('');
      setNotifyOnErrors(false);
      return;
    }

    const email = (accountSettings.notification_email as string) ?? '';
    const notify = Boolean(accountSettings.notify_on_errors);
    setNotificationEmail(email);
    setNotifyOnErrors(notify);
  }, [currentAccount, accountSettings]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ full_name: fullName });
      toast.success(t('settings.profile.success'));
    } catch (error) {
      toast.error(t('settings.profile.error'));
    }
  };

  const handleSaveNotifications = async () => {
    if (!currentAccount || savingNotifications) return;

    const trimmedEmail = notificationEmail.trim();

    if (notifyOnErrors && trimmedEmail.length === 0) {
      toast.error(t('settings.notifications.emailRequired'));
      return;
    }

    setSavingNotifications(true);

    const currentSettings = (currentAccount.settings as Record<string, unknown>) ?? {};
    const newSettings = {
      ...currentSettings,
      notification_email: trimmedEmail.length > 0 ? trimmedEmail : null,
      notify_on_errors: notifyOnErrors,
    };

    try {
      const res = await fetch(`/api/data/accounts?id=eq.${currentAccount.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (!res.ok) {
        toast.error(t('settings.notifications.updateError'));
      } else {
        await refreshAccounts();
        toast.success(t('settings.notifications.updateSuccess'));
      }
    } catch (err) {
      toast.error(t('settings.notifications.updateError'));
    }

    setSavingNotifications(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              {t('settings.tabs.profile')}
            </TabsTrigger>
            {canManageData && (
              <TabsTrigger value="matching" className="gap-2">
                <Users className="h-4 w-4" />
                {t('settings.tabs.matching')}
              </TabsTrigger>
            )}
            {canManageData && (
              <TabsTrigger value="data" className="gap-2">
                <Database className="h-4 w-4" />
                {t('settings.tabs.data')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Language Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t('settings.language.title')}
                </CardTitle>
                <CardDescription>
                  {t('settings.language.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant={currentLanguage === 'uk' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeLanguage('uk')}
                  >
                    {t('common.lang.uk')}
                  </Button>
                  <Button
                    variant={currentLanguage === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeLanguage('en')}
                  >
                    {t('common.lang.en')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications.title')}</CardTitle>
                <CardDescription>
                  {t('settings.notifications.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-email">{t('settings.notifications.emailLabel')}</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    value={notificationEmail}
                    onChange={(event: any) => setNotificationEmail(event.target.value)}
                    placeholder={t('settings.notifications.emailPlaceholder')}
                    disabled={!currentAccount || savingNotifications}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('settings.notifications.emailHint')}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <Label htmlFor="notify-on-errors" className="text-sm font-medium">
                      {t('settings.notifications.toggleLabel')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('settings.notifications.toggleHint')}
                    </p>
                  </div>
                  <Switch
                    id="notify-on-errors"
                    checked={notifyOnErrors}
                    onCheckedChange={setNotifyOnErrors}
                    disabled={!currentAccount || savingNotifications}
                  />
                </div>
                {!currentAccount && (
                  <p className="text-xs text-muted-foreground">
                    {t('settings.notifications.noAccount')}
                  </p>
                )}
                <Button
                  onClick={handleSaveNotifications}
                  disabled={!currentAccount || savingNotifications}
                >
                  {savingNotifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('settings.notifications.saving')}
                    </>
                  ) : (
                    t('settings.notifications.save')
                  )}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profile.title')}</CardTitle>
                <CardDescription>
                  {t('settings.profile.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('settings.profile.fullName')}</Label>
                      <Input
                        id="fullName"
                        value={fullName || profile?.full_name || ''}
                        onChange={(e: any) => setFullName(e.target.value)}
                        placeholder={t('settings.profile.namePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('settings.profile.emailLabel')}</Label>
                      <Input
                        value={profile?.id ? t('settings.profile.emailLinked') : ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t('settings.profile.emailReadonly')}
                      </p>
                    </div>
                    <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('settings.profile.saving')}
                        </>
                      ) : (
                        t('settings.profile.save')
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canManageData && (
            <TabsContent value="matching">
              <MappingHub />
            </TabsContent>
          )}

          {canManageData && (
            <TabsContent value="data">
              <DataCleanupTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
