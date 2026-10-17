import { Navigate, Route, Routes } from 'react-router-dom'

import Layout from '@/layouts/Layout/Layout'
import NotFound from '@/NotFound'
import Dashboard from '@/pages/Dashboard/Dashboard'
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
import SignIn from '@/pages/Sign/Sign-in'
import { ROUTE_PATHS } from '@/routes/route'

const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<Navigate to={ROUTE_PATHS.SIGN_IN} replace />} />
      <Route
        path={ROUTE_PATHS.SIGN_IN}
        element={<SignIn />}
      />
      {/* 레이아웃 라우트 */}
      <Route element={<Layout />}>
        {/* 예: /home -> / 리다이렉트 */}
        {/* <Route index element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} /> */}
        <Route
          path={ROUTE_PATHS.DASHBOARD}
          element={<Dashboard />}
        />
        <Route path="/grid" element={<Navigate to={ROUTE_PATHS.GRID} replace />} />
        <Route path="/pagination" element={<Navigate to={ROUTE_PATHS.PAGINATION} replace />} />
        <Route path={ROUTE_PATHS.EXAMPLES} element={<ExampleDetail />} >
          <Route index element={<Examples />} />
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
