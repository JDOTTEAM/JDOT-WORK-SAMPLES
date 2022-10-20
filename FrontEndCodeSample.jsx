import React, {useState} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';

import {useDispatch, useSelector} from 'react-redux';
import {setAccessToken, setRestaurantId, setUserData} from '../store/actions/authActions';
import {setHistoryData} from '../store/actions/ordersActions';

import CreateNewPassword from "../pages/auth-pages/create-new-password-page/CreateNewPasswordPage";

import {Sidebar, ResetPopup} from '../components';
import {
    LoginPage,
    SignUpPage,
    RegistrationConfirm,
    MenuManagerPage,
    HistoryPage,
    ActiveOrdersPage,
    AnalyticsPage,
    ChangePasswordPage,
    EmployeesPage,
    ManagementPage,
    NewOrdersPage,
} from '../pages';
import PrivateRoute from './PrivateRoute';

import classes from './MyRoutes.module.css';


const MyRoutes = () => {
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const [openResetPopup, setResetPopup] = useState(false);

    const access_token = useSelector((state) => state.authReducer.accessToken);
    const employee = useSelector((state) => state.authReducer.user.isEmployee);

    const data = localStorage.getItem('auth');
    const authReducerStateData = JSON.parse(data);
    const user = localStorage.getItem('user');
    const userReducerStateData = JSON.parse(user);

    if(authReducerStateData){
        dispatch(setAccessToken(authReducerStateData.token));
        dispatch(setRestaurantId(authReducerStateData.restaurantId));
    };

    if(userReducerStateData){
        dispatch(setUserData(userReducerStateData));
    };

    return (
        <div className={access_token ? classes['main-root'] : classes['auth-root']}>
            <Router>
                {access_token && <div className={classes['menu-wrapper']}><Sidebar setEmail={setEmail} setPassword={setPassword} /></div>}
                {openResetPopup && <ResetPopup
                    setPassword={setPassword}
                    email={email}
                    setEmail={setEmail}
                    setPopup={setResetPopup}
                />}
                <div className={access_token ? classes['pages-wrapper'] : classes['login-form-wrapper']}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                access_token ? <Navigate to={!employee ? "/menu-manager" : "/new-orders"} /> : <Navigate to="/login" />
                            }
                        />
                        <Route
                            path="/login"
                            element={
                                access_token ? <Navigate to={!employee ? "/menu-manager" : "/new-orders"} /> :
                                    <LoginPage
                                        email={email}
                                        setEmail={setEmail}
                                        setPassword={setPassword}
                                        password={password}
                                        passwordShown={passwordShown}
                                        setPopup={setResetPopup}
                                        setPasswordShown={setPasswordShown}
                                    />
                            }
                        />
                        <Route
                            path="/change-password/code/:id"
                            element={
                                access_token ? <Navigate to={!employee ? "/menu-manager" : "/new-orders"} /> :
                                    <CreateNewPassword />
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                access_token ? <Navigate to={!employee ? "/menu-manager" : "/new-orders"} /> :
                                    <SignUpPage />
                            }
                        />
                        <Route
                            path="/registration-confirm"
                            element={
                                access_token ? <Navigate to={!employee ? "/menu-manager" : "/new-orders"} /> :
                                    <RegistrationConfirm />
                            }
                        />
                        <Route
                            path="/menu-manager"
                            element={
                                <PrivateRoute>
                                    <MenuManagerPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/new-orders"
                            element={
                                <PrivateRoute>
                                    <NewOrdersPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/active-orders"
                            element={
                                <PrivateRoute>
                                    <ActiveOrdersPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <PrivateRoute>
                                    <HistoryPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/analytics"
                            element={
                                <PrivateRoute>
                                    <AnalyticsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/management"
                            element={
                                <PrivateRoute>
                                    <ManagementPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/employees"
                            element={
                                <PrivateRoute>
                                    <EmployeesPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/new-password"
                            element={
                                <PrivateRoute>
                                    <ChangePasswordPage />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </div>
    )
};

export default MyRoutes;
