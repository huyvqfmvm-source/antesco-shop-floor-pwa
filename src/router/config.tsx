import type { RouteObject } from "react-router-dom";
import LoginPage from "@/pages/login/page";
import SampleAccountsPage from "@/pages/login/SampleAccounts";
import RegisterPage from "@/pages/register/page";
import AccountPage from "@/pages/account/page";
import HomePage from "@/pages/home/page";
import ProductionPage from "@/pages/production/page";
import ProductionDetailPage from "@/pages/production/DetailPage";
import ProductionMaterialPage from "@/pages/production/MaterialPage";
import ProductionWipPage from "@/pages/production/WipPage";
import ProductionPalletPage from "@/pages/production/PalletPage";
import ProductionConfirmPage from "@/pages/production/ConfirmPage";
import ProductionUtilityPage from "@/pages/production/UtilityPage";
import InboundPage from "@/pages/inbound/page";
import ReceiveRMPage from "@/pages/inbound/ReceiveRM";
import FGReceivingPage from "@/pages/inbound/FGReceiving";
import PutawayPage from "@/pages/inbound/Putaway";
import PendingListPage from "@/pages/inbound/PendingList";
import OutboundPage from "@/pages/outbound/page";
import FEFOPickingPage from "@/pages/outbound/FEFOPicking";
import BTPIssuePage from "@/pages/outbound/BTPIssue";
import ContainerLoadingPage from "@/pages/outbound/ContainerLoading";
import InternalQMPage from "@/pages/internal-qm/page";
import QMHoldPage from "@/pages/internal-qm/QMHold";
import TransferOrderPage from "@/pages/internal-qm/TransferOrder";
import ReceiveTransferPage from "@/pages/internal-qm/ReceiveTransfer";
import CycleCountPage from "@/pages/internal-qm/CycleCount";
import DefectCodesPage from "@/pages/internal-qm/DefectCodes";
import ErrorQueueResolverPage from "@/pages/internal-qm/ErrorQueueResolver";
import SettingsPage from "@/pages/settings/page";
import MobileLayout from "@/components/feature/MobileLayout";
import NotFound from "@/pages/NotFound";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/login/sample-accounts",
    element: <SampleAccountsPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <MobileLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
      {
        path: "production",
        children: [
          { index: true, element: <ProductionPage /> },
          { path: "detail/:id", element: <ProductionDetailPage /> },
          { path: "material/:id", element: <ProductionMaterialPage /> },
          { path: "wip/:id", element: <ProductionWipPage /> },
          { path: "pallet/:id", element: <ProductionPalletPage /> },
          { path: "confirm/:id", element: <ProductionConfirmPage /> },
          { path: "utility", element: <ProductionUtilityPage /> },
        ],
      },
      {
        path: "inbound",
        children: [
          { index: true, element: <InboundPage /> },
          { path: "receive-rm", element: <ReceiveRMPage /> },
          { path: "fg-receiving", element: <FGReceivingPage /> },
          { path: "putaway", element: <PutawayPage /> },
          { path: "pending", element: <PendingListPage /> },
        ],
      },
      {
        path: "outbound",
        children: [
          { index: true, element: <OutboundPage /> },
          { path: "fefo-picking/:id", element: <FEFOPickingPage /> },
          { path: "btp-issue", element: <BTPIssuePage /> },
          { path: "container-loading/:id", element: <ContainerLoadingPage /> },
        ],
      },
      {
        path: "internal-qm",
        children: [
          { index: true, element: <InternalQMPage /> },
          { path: "qm-hold", element: <QMHoldPage /> },
          { path: "transfer-order", element: <TransferOrderPage /> },
          { path: "receive-transfer", element: <ReceiveTransferPage /> },
          { path: "cycle-count", element: <CycleCountPage /> },
          { path: "defect-codes", element: <DefectCodesPage /> },
          { path: "error-queue", element: <ErrorQueueResolverPage /> },
        ],
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;