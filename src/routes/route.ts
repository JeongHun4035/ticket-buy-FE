export const ROUTE_PATHS = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  MAIN: '/',
  RESERVATIONS: '/reservations',
  ADMIN: '/admin',
  SUPPORT: '/support',
  BOARD: '/board',
  EXAMPLES: '/examples',
  CHART: '/examples/chart',
  GRID: '/examples/grid',
  PAGINATION: '/examples/pagination',
} as const

export type RouteKey = keyof typeof ROUTE_PATHS
export type RoutePath = (typeof ROUTE_PATHS)[RouteKey]

// 사이드바/메뉴 등에 쓸 메타 정보
export interface AppRouteMeta {
  key: RouteKey,
  path: RoutePath,
  label: string,
  showInNav?: boolean,
}

export const APP_ROUTES: AppRouteMeta[] = [
  {
    key: 'SUPPORT',
    path: ROUTE_PATHS.SUPPORT,
    label: '고객센터',
    showInNav: true,
  },
  {
    key: 'BOARD',
    path: ROUTE_PATHS.BOARD,
    label: '게시판',
    showInNav: true,
  },
  {
    key: 'SIGN_IN',
    path: ROUTE_PATHS.SIGN_IN,
    label: '로그인',
    showInNav: true,
  },
  {
    key: 'MAIN',
    path: ROUTE_PATHS.MAIN,
    label: '메인',
    showInNav: true,
  },
  {
    key: 'EXAMPLES',
    path: ROUTE_PATHS.EXAMPLES,
    label: '예제 페이지',
    showInNav: true,
  },


//   {
//     key: 'LOGIN',
//     path: ROUTE_PATHS.LOGIN,
//     label: '로그인',
//     showInNav: false,
//   },
//   {
//     key: 'SETTINGS',
//     path: ROUTE_PATHS.SETTINGS,
//     label: '설정',
//     showInNav: true,
//   },
]

