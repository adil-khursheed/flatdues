import Add01Icon from "@hugeicons/core-free-icons/Add01Icon";
import AlertCircleIcon from "@hugeicons/core-free-icons/AlertCircleIcon";
import ArrowDownLeft01Icon from "@hugeicons/core-free-icons/ArrowDownLeft01Icon";
import ArrowLeft01Icon from "@hugeicons/core-free-icons/ArrowLeft01Icon";
import ArrowRight01Icon from "@hugeicons/core-free-icons/ArrowRight01Icon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import Building03Icon from "@hugeicons/core-free-icons/Building03Icon";
import Calendar01Icon from "@hugeicons/core-free-icons/Calendar01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Car01Icon from "@hugeicons/core-free-icons/Car01Icon";
import ChartAverageIcon from "@hugeicons/core-free-icons/ChartAverageIcon";
import CheckmarkCircle01Icon from "@hugeicons/core-free-icons/CheckmarkCircle01Icon";
import CleaningBucketIcon from "@hugeicons/core-free-icons/CleaningBucketIcon";
import ClipboardPasteIcon from "@hugeicons/core-free-icons/ClipboardPasteIcon";
import Clock01Icon from "@hugeicons/core-free-icons/Clock01Icon";
import Copy01Icon from "@hugeicons/core-free-icons/Copy01Icon";
import Delete01Icon from "@hugeicons/core-free-icons/Delete01Icon";
import Edit01Icon from "@hugeicons/core-free-icons/Edit01Icon";
import ElectricHome01Icon from "@hugeicons/core-free-icons/ElectricHome01Icon";
import FilterIcon from "@hugeicons/core-free-icons/FilterIcon";
import Home01Icon from "@hugeicons/core-free-icons/Home01Icon";
import InboxIcon from "@hugeicons/core-free-icons/InboxIcon";
import InformationCircleIcon from "@hugeicons/core-free-icons/InformationCircleIcon";
import Invoice01Icon from "@hugeicons/core-free-icons/Invoice01Icon";
import LockPasswordIcon from "@hugeicons/core-free-icons/LockPasswordIcon";
import Login01Icon from "@hugeicons/core-free-icons/Login01Icon";
import Logout01Icon from "@hugeicons/core-free-icons/Logout01Icon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import Money01Icon from "@hugeicons/core-free-icons/Money01Icon";
import MoneyExchange01Icon from "@hugeicons/core-free-icons/MoneyExchange01Icon";
import MoreHorizontalIcon from "@hugeicons/core-free-icons/MoreHorizontalIcon";
import PackageIcon from "@hugeicons/core-free-icons/PackageIcon";
import PlusSignIcon from "@hugeicons/core-free-icons/PlusSignIcon";
import RefreshIcon from "@hugeicons/core-free-icons/RefreshIcon";
import Restaurant01Icon from "@hugeicons/core-free-icons/Restaurant01Icon";
import Settings01Icon from "@hugeicons/core-free-icons/Settings01Icon";
import Share01Icon from "@hugeicons/core-free-icons/Share01Icon";
import ShieldUserIcon from "@hugeicons/core-free-icons/ShieldUserIcon";
import ShoppingBasket01Icon from "@hugeicons/core-free-icons/ShoppingBasket01Icon";
import ToolsIcon from "@hugeicons/core-free-icons/ToolsIcon";
import UserAdd01Icon from "@hugeicons/core-free-icons/UserAdd01Icon";
import UserBlock01Icon from "@hugeicons/core-free-icons/UserBlock01Icon";
import UserCheck01Icon from "@hugeicons/core-free-icons/UserCheck01Icon";
import UserGroupIcon from "@hugeicons/core-free-icons/UserGroupIcon";
import UserIcon from "@hugeicons/core-free-icons/UserIcon";
import UserMinus01Icon from "@hugeicons/core-free-icons/UserMinus01Icon";
import UserMultipleIcon from "@hugeicons/core-free-icons/UserMultipleIcon";
import Wallet01Icon from "@hugeicons/core-free-icons/Wallet01Icon";
import type { IconSvgElement } from "@hugeicons/react-native";

type IconMap = Record<string, IconSvgElement>;

export const icons = {
  tabs: {
    home: Home01Icon,
    expenses: Invoice01Icon,
    balances: Wallet01Icon,
    settings: Settings01Icon,
  } satisfies IconMap,
  actions: {
    add: PlusSignIcon,
    back: ArrowLeft01Icon,
    close: Cancel01Icon,
    confirm: CheckmarkCircle01Icon,
    copy: Copy01Icon,
    delete: Delete01Icon,
    edit: Edit01Icon,
    filter: FilterIcon,
    forward: ArrowRight01Icon,
    invite: UserAdd01Icon,
    leave: Logout01Icon,
    more: MoreHorizontalIcon,
    paste: ClipboardPasteIcon,
    refresh: RefreshIcon,
    share: Share01Icon,
    signOut: Logout01Icon,
    promote: UserAdd01Icon,
    demote: UserMinus01Icon,
    reactivate: UserCheck01Icon,
    deactivate: UserBlock01Icon,
  } satisfies IconMap,
  categories: {
    groceries: ShoppingBasket01Icon,
    food: Restaurant01Icon,
    utilities: ElectricHome01Icon,
    rent: Home01Icon,
    housekeeping: CleaningBucketIcon,
    maintenance: ToolsIcon,
    household: PackageIcon,
    transport: Car01Icon,
    other: MoreHorizontalIcon,
  } satisfies IconMap,
  activity: {
    expense: Invoice01Icon,
    paid: ArrowUpRight01Icon,
    received: ArrowDownLeft01Icon,
    settlement: MoneyExchange01Icon,
  } satisfies IconMap,
  states: {
    budget: ChartAverageIcon,
    empty: InboxIcon,
    error: AlertCircleIcon,
    information: InformationCircleIcon,
    settled: CheckmarkCircle01Icon,
  } satisfies IconMap,
  entities: {
    admin: ShieldUserIcon,
    budget: Money01Icon,
    calendar: Calendar01Icon,
    capacity: UserMultipleIcon,
    expiry: Clock01Icon,
    member: UserIcon,
    expense: Add01Icon,
    members: UserGroupIcon,
    profile: UserIcon,
    workspace: Building03Icon,
  } satisfies IconMap,
  auth: {
    email: Mail01Icon,
    password: LockPasswordIcon,
    signIn: Login01Icon,
    user: UserIcon,
  } satisfies IconMap,
} as const;

export type AppIconData = IconSvgElement;
