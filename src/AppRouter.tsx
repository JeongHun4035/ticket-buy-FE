import { Navigate, Route, Routes } from 'react-router-dom'

import RequireAdmin from '@/components/auth/RequireAdmin'
import RequireAuth from '@/components/auth/RequireAuth'
import Layout from '@/layouts/Layout/Layout'
import NotFound from '@/NotFound'
import Admin from '@/pages/Admin/Admin'
import EventCreate from '@/pages/Admin/EventCreate'
import Board from '@/pages/Board/Board'
import ChartPage from '@/pages/Examples/children/Chart/Chart'
import ConfirmPage from '@/pages/Examples/children/Confirm/Confirm'
import DatePickerPage from '@/pages/Examples/children/DatePicker/DatePicker'
import GridPage from '@/pages/Examples/children/Grid/Grid'
import InfiniteScrollPage from '@/pages/Examples/children/InfiniteScroll/InfiniteScroll'
import PaginationPage from '@/pages/Examples/children/Pagination/Pagination'
import PopupPage from '@/pages/Examples/children/Popup/Popup'
import SelectPage from '@/pages/Examples/children/Select/Select'
import ToastPage from '@/pages/Examples/children/Toast/Toast'
import ExampleDetail from '@/pages/Examples/ExampleDetail'
import Examples from '@/pages/Examples/Examples'
import SeatMapExample from '@/pages/Examples/SeatMapExample'
import Main from '@/pages/Main/Main'
import Payments from '@/pages/Payments/Payments'
import Reservations from '@/pages/Reservations/Reservations'
import SignIn from '@/pages/Sign/Sign-in'
import SignUp from '@/pages/Sign/Sign-up'
import Support from '@/pages/Support/Support'
import { ROUTE_PATHS } from '@/routes/route'

const AppRouter = () => {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.SIGN_UP} element={<SignUp />} />
      <Route
        path={ROUTE_PATHS.SIGN_IN}
        element={<SignIn />}
      />
      {/* 레이아웃 라우트 */}
      <Route element={<Layout />}>
        <Route element={<RequireAuth />}>
          <Route path={ROUTE_PATHS.PAYMENTS} element={<Payments />} />
          <Route path={ROUTE_PATHS.RESERVATIONS} element={<Reservations />} />
          <Route element={<RequireAdmin />}><Route path={ROUTE_PATHS.ADMIN} element={<Admin />} /><Route path={ROUTE_PATHS.ADMIN_EVENT_NEW} element={<EventCreate />} /></Route>
          <Route path={ROUTE_PATHS.SUPPORT} element={<Support />} />
        </Route>
        <Route path={ROUTE_PATHS.BOARD} element={<Board />} />
        <Route
          path={ROUTE_PATHS.MAIN}
          element={<Main />}
        />
        <Route path="/grid" element={<Navigate to={ROUTE_PATHS.GRID} replace />} />
        <Route path="/pagination" element={<Navigate to={ROUTE_PATHS.PAGINATION} replace />} />
        <Route path={ROUTE_PATHS.EXAMPLES} element={<ExampleDetail />} >
          <Route index element={<Examples />} />
          <Route path="seats" element={<SeatMapExample />} />
          <Route path={ROUTE_PATHS.CHART} element={<ChartPage />} />
          <Route path="infinite-scroll" element={<InfiniteScrollPage />} />
          <Route path={ROUTE_PATHS.GRID} element={<GridPage />} />
          <Route path={ROUTE_PATHS.PAGINATION} element={<PaginationPage />} />
          <Route path="toast" element={<ToastPage />} />
          <Route path="datepicker" element={<DatePickerPage />} />
          <Route
            path="select"
            element={<SelectPage />}
          />
          <Route
            path="popup"
            element={<PopupPage />}
          />
          <Route
            path="confirm"
            element={<ConfirmPage />}
          />
        </Route>
        {/* 404 */}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter


