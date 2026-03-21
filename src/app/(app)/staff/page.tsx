"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTeamMembers,
  usePendingInvites,
  useInviteTeamMember,
  useResendInvite,
  useCancelInvite,
  useUpdateMemberRole,
  useTransferOwnership,
  useRemoveMember,
} from "@/hooks/useTeamManagement";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Mail,
  Clock,
  MoreHorizontal,
  Trash2,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { getErrorMessage } from "@/lib/utils/errors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const t = (key: string) => key;

type AccountRole = "owner" | "admin" | "manager" | "staff";

export default function StaffPage() {
  const profile = useAuthStore((s) => s.profile);
  const currentRole = useAuthStore((s) => s.userRole) ?? "staff";

  const { data: members, isLoading: membersLoading } = useTeamMembers();
  const { data: invites, isLoading: invitesLoading } = usePendingInvites();
  const inviteMember = useInviteTeamMember();
  const resendInvite = useResendInvite();
  const cancelInvite = useCancelInvite();
  const updateRole = useUpdateMemberRole();
  const transferOwnership = useTransferOwnership();
  const removeMember = useRemoveMember();
  const { toast } = useToast();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AccountRole>("staff");

  const roleLabels: Record<AccountRole, string> = {
    owner: t("teamSettings.roles.owner.label"),
    admin: t("teamSettings.roles.admin.label"),
    manager: t("teamSettings.roles.manager.label"),
    staff: t("teamSettings.roles.staff.label"),
  };

  const roleDescriptions: Record<AccountRole, string> = {
    owner: t("teamSettings.roles.owner.description"),
    admin: t("teamSettings.roles.admin.description"),
    manager: t("teamSettings.roles.manager.description"),
    staff: t("teamSettings.roles.staff.description"),
  };

  const canManageTeam = currentRole === "owner" || currentRole === "admin";

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await inviteMember.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      toast({
        title: t("teamSettings.toasts.inviteSent.title"),
        description: t("teamSettings.toasts.inviteSent.description"),
      });
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("staff");
    } catch (error: any) {
      const errorMessage = getErrorMessage(
        error,
        t("teamSettings.toasts.inviteFailed.description")
      );

      if (/already a team member/i.test(errorMessage)) {
        toast({
          title: t("teamSettings.toasts.memberAlreadyInTeam.title"),
          description: t("teamSettings.toasts.memberAlreadyInTeam.description"),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite.mutateAsync(inviteId);
      toast({
        title: t("teamSettings.toasts.inviteCancelled.title"),
        description: t("teamSettings.toasts.inviteCancelled.description"),
      });
    } catch {
      toast({
        title: t("common.error"),
        description: t("teamSettings.toasts.cancelInviteFailed.description"),
        variant: "destructive",
      });
    }
  };

  const handleResendInvite = async (
    inviteId: string,
    email: string,
    role: AccountRole
  ) => {
    try {
      await resendInvite.mutateAsync({ inviteId, email, role });
      toast({
        title: t("teamSettings.toasts.inviteResent.title"),
        description: t("teamSettings.toasts.inviteResent.description"),
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(
        error,
        t("teamSettings.toasts.resendInviteFailed.description")
      );
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (
    memberUserId: string,
    role: AccountRole
  ) => {
    try {
      await updateRole.mutateAsync({ memberUserId, role });
      toast({ title: t("teamSettings.toasts.roleUpdated.title") });
    } catch {
      toast({
        title: t("common.error"),
        description: t("teamSettings.toasts.updateRoleFailed.description"),
        variant: "destructive",
      });
    }
  };

  const handleTransferOwnership = async (
    memberUserId: string,
    memberName: string
  ) => {
    try {
      await transferOwnership.mutateAsync({ newOwnerUserId: memberUserId });
      toast({
        title: t("teamSettings.toasts.ownershipTransferred.title"),
        description: t("teamSettings.toasts.ownershipTransferred.description"),
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(
        error,
        t("teamSettings.toasts.transferOwnershipFailed.description")
      );
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberUserId: string) => {
    try {
      await removeMember.mutateAsync(memberUserId);
      toast({
        title: t("teamSettings.toasts.memberRemoved.title"),
        description: t("teamSettings.toasts.memberRemoved.description"),
      });
    } catch {
      toast({
        title: t("common.error"),
        description: t("teamSettings.toasts.removeMemberFailed.description"),
        variant: "destructive",
      });
    }
  };

  const isLoading = membersLoading || invitesLoading;
  const now = new Date();
  const invitesWithStatus =
    (invites as any[])?.map((invite: any) => ({
      ...invite,
      isExpired: new Date(invite.expires_at) <= now,
    })) ?? [];
  const sortedInvites = [...invitesWithStatus].sort((a: any, b: any) => {
    if (a.isExpired !== b.isExpired) {
      return a.isExpired ? 1 : -1;
    }
    return (
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={t("teamSettings.pageHeader.title")}
          subtitle={t("teamSettings.pageHeader.subtitle")}
        />

        {canManageTeam && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                {t("teamSettings.actions.inviteMember")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t("teamSettings.inviteDialog.title")}
                </DialogTitle>
                <DialogDescription>
                  {t("teamSettings.inviteDialog.description")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("teamSettings.inviteDialog.emailLabel")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t(
                      "teamSettings.inviteDialog.emailPlaceholder"
                    )}
                    value={inviteEmail}
                    onChange={(e: any) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">
                    {t("teamSettings.columns.role")}
                  </Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v: any) =>
                      setInviteRole(v as AccountRole)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentRole === "owner" && (
                        <SelectItem value="admin">
                          <div>
                            <div className="font-medium">
                              {roleLabels.admin}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {roleDescriptions.admin}
                            </div>
                          </div>
                        </SelectItem>
                      )}
                      <SelectItem value="manager">
                        <div>
                          <div className="font-medium">
                            {roleLabels.manager}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {roleDescriptions.manager}
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="staff">
                        <div>
                          <div className="font-medium">
                            {roleLabels.staff}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {roleDescriptions.staff}
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={
                    !inviteEmail.trim() || inviteMember.isPending
                  }
                >
                  {t("teamSettings.actions.sendInvite")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>{t("teamSettings.teamMembers.title")}</CardTitle>
          <CardDescription>
            {t("teamSettings.teamMembers.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("teamSettings.columns.member")}</TableHead>
                  <TableHead>{t("teamSettings.columns.role")}</TableHead>
                  <TableHead>{t("teamSettings.columns.joined")}</TableHead>
                  {canManageTeam && (
                    <TableHead className="text-right">
                      {t("teamSettings.columns.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(members as any[])?.map((member: any) => {
                  const isSelf = member.user_id === profile?.id;
                  const isOwner = member.role === "owner";

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                member.profile?.avatar_url || undefined
                              }
                            />
                            <AvatarFallback>
                              {member.profile?.full_name?.[0] ||
                                t(
                                  "teamSettings.fallbacks.unknownInitial"
                                )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {member.profile?.full_name ||
                                t(
                                  "teamSettings.fallbacks.unknownUser"
                                )}
                              {isSelf && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {t("teamSettings.youBadge")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isOwner ? "default" : "secondary"
                          }
                        >
                          {roleLabels[member.role as AccountRole]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(
                          new Date(member.created_at),
                          "MMM d, yyyy"
                        )}
                      </TableCell>
                      {canManageTeam && (
                        <TableCell className="text-right">
                          {!isOwner && !isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {currentRole === "owner" && (
                                  <>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          onSelect={() => undefined}
                                        >
                                          {t(
                                            "teamSettings.actions.transferOwnership"
                                          )}
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            {t(
                                              "teamSettings.transferOwnershipDialog.title"
                                            )}
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {t(
                                              "teamSettings.transferOwnershipDialog.description"
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            {t("common.cancel")}
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleTransferOwnership(
                                                member.user_id,
                                                member.profile
                                                  ?.full_name ||
                                                  t(
                                                    "teamSettings.fallbacks.unknownUser"
                                                  )
                                              )
                                            }
                                            disabled={
                                              transferOwnership.isPending
                                            }
                                          >
                                            {t(
                                              "teamSettings.actions.transferOwnership"
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {currentRole === "owner" && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateRole(
                                          member.user_id,
                                          "admin"
                                        )
                                      }
                                    >
                                      {t(
                                        "teamSettings.actions.makeAdmin"
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateRole(
                                          member.user_id,
                                          "manager"
                                        )
                                      }
                                    >
                                      {t(
                                        "teamSettings.actions.makeManager"
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateRole(
                                          member.user_id,
                                          "staff"
                                        )
                                      }
                                    >
                                      {t(
                                        "teamSettings.actions.makeStaff"
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={() => undefined}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      {t(
                                        "teamSettings.actions.remove"
                                      )}
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {t(
                                          "teamSettings.removeMemberDialog.title"
                                        )}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t(
                                          "teamSettings.removeMemberDialog.description"
                                        )}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {t("common.cancel")}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleRemoveMember(
                                            member.user_id
                                          )
                                        }
                                        disabled={
                                          removeMember.isPending
                                        }
                                      >
                                        {t(
                                          "teamSettings.actions.remove"
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {canManageTeam && sortedInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("teamSettings.invitations.title")}</CardTitle>
            <CardDescription>
              {t("teamSettings.invitations.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("teamSettings.columns.email")}</TableHead>
                  <TableHead>{t("teamSettings.columns.role")}</TableHead>
                  <TableHead>{t("teamSettings.columns.status")}</TableHead>
                  <TableHead>{t("teamSettings.columns.expires")}</TableHead>
                  <TableHead className="text-right">
                    {t("teamSettings.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvites.map((invite: any) => (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invite.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {roleLabels[invite.role as AccountRole]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invite.isExpired ? "destructive" : "outline"
                        }
                      >
                        {invite.isExpired
                          ? t("teamSettings.status.expired")
                          : t("teamSettings.status.pending")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(
                          new Date(invite.expires_at),
                          "MMM d, HH:mm"
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const link = `${window.location.origin}/invite/${invite.token}`;
                            navigator.clipboard.writeText(link);
                            toast({
                              title: t(
                                "teamSettings.toasts.linkCopied.title"
                              ),
                              description: t(
                                "teamSettings.toasts.linkCopied.description"
                              ),
                            });
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          {t("teamSettings.actions.copyLink")}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: any) => e.preventDefault()}
                            >
                              {t("teamSettings.actions.resend")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("teamSettings.resendDialog.title")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t(
                                  "teamSettings.resendDialog.description"
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("common.cancel")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleResendInvite(
                                    invite.id,
                                    invite.email,
                                    invite.role
                                  )
                                }
                                disabled={resendInvite.isPending}
                              >
                                {t(
                                  "teamSettings.actions.resendInvite"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: any) => e.preventDefault()}
                            >
                              {t("teamSettings.actions.cancel")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t(
                                  "teamSettings.cancelInviteDialog.title"
                                )}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t(
                                  "teamSettings.cancelInviteDialog.description"
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("teamSettings.actions.keepInvite")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleCancelInvite(invite.id)
                                }
                                disabled={cancelInvite.isPending}
                              >
                                {t(
                                  "teamSettings.actions.cancelInvite"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
