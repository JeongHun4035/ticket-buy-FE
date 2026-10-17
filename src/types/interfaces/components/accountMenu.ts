export interface AccountMenuProps {
  userName: string,
  role: string,
  onSignOut: () => Promise<void>,
}
