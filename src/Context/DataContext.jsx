import { createContext, useState, useContext, useEffect, useCallback } from "react";
import API from "../api/axios";

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        registeredWarranties: 0,
        activeWarranties: 0,
        recentRegistrations: [],
    });
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [customersMeta, setCustomersMeta] = useState({ total: 0, page: 1, limit: 0 });
    const [customerStats, setCustomerStats] = useState({ totalAll: 0, active: 0, expired: 0, newToday: 0 });
    const [recentServices, setRecentServices] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState({
        stats: false,
        products: false,
        customers: false,
        services: false,
        notifications: false,
        unread: false,
    });

    const fetchStats = useCallback(async (filters = {}) => {
        setLoading(prev => ({ ...prev, stats: true }));
        try {
            const query = new URLSearchParams(filters).toString();
            const { data } = await API.get(`/stats?${query}`);
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(prev => ({ ...prev, stats: false }));
        }
    }, []);

    const [productsMeta, setProductsMeta] = useState({ total: 0, page: 1, limit: 0 });

    const DEFAULT_PAGE_SIZE = 50;

    const fetchProducts = useCallback(async (options = {}) => {
        setLoading(prev => ({ ...prev, products: true }));
        try {
            const { page = 1, limit = DEFAULT_PAGE_SIZE, q = "" } = options;
            const params = new URLSearchParams();
            if (page) params.append("page", page);
            if (limit) params.append("limit", limit);
            if (q) params.append("q", q);

            const url = `/products${params.toString() ? `?${params.toString()}` : ""}`;
            const { data } = await API.get(url);

            if (data && data.data && Array.isArray(data.data)) {
                setProducts(data.data);
                setProductsMeta({ total: data.total || 0, page: data.page || page, limit: data.limit || limit });
            } else {
                setProducts(data);
                setProductsMeta({ total: Array.isArray(data) ? data.length : 0, page: 1, limit: 0 });
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(prev => ({ ...prev, products: false }));
        }
    }, []);

    const fetchCustomers = useCallback(async (options = {}) => {
        setLoading(prev => ({ ...prev, customers: true }));
        try {
            const { page = 1, limit = DEFAULT_PAGE_SIZE, q = "" } = options;
            const params = new URLSearchParams();
            if (page) params.append("page", page);
            if (limit) params.append("limit", limit);
            if (q) params.append("q", q);

            const url = `/register${params.toString() ? `?${params.toString()}` : ""}`;
            const { data } = await API.get(url);

            if (data && data.data && Array.isArray(data.data)) {
                setCustomers(data.data);
                setCustomersMeta({ total: data.total || 0, page: data.page || page, limit: data.limit || limit });
                if (data.stats) setCustomerStats(data.stats);
            } else {
                setCustomers(data);
                setCustomersMeta({ total: Array.isArray(data) ? data.length : 0, page: 1, limit: 0 });
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(prev => ({ ...prev, customers: false }));
        }
    }, []);

    const fetchRecentServices = useCallback(async () => {
        setLoading(prev => ({ ...prev, services: true }));
        try {
            const { data } = await API.get("/service/history");
            if (data.recentServices) {
                setRecentServices(data.recentServices);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(prev => ({ ...prev, services: false }));
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        // only fetch once unless explicitly refreshed
        if (notifications.length > 0) return;
        setLoading(prev => ({ ...prev, notifications: true }));
        try {
            const { data } = await API.get("/notifications?limit=20");
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(prev => ({ ...prev, notifications: false }));
        }
    }, [notifications.length]);

    const fetchUnreadCount = useCallback(async () => {
        setLoading(prev => ({ ...prev, unread: true }));
        try {
            const { data } = await API.get("/notifications/unread");
            const count = data.count || 0;
            setUnreadCount(count);
            return count;
        } catch (error) {
            console.error("Error fetching unread count:", error);
            return null;
        } finally {
            setLoading(prev => ({ ...prev, unread: false }));
        }
    }, []);

    // Initial load
    const refreshAll = useCallback(() => {
        fetchStats();
        fetchProducts();
        fetchCustomers();
        fetchRecentServices();
    }, [fetchStats, fetchProducts, fetchCustomers, fetchRecentServices]);

    return (
        <DataContext.Provider value={{
            stats, setStats, fetchStats,
            products, setProducts, productsMeta, setProductsMeta, fetchProducts,
            customers, setCustomers, customersMeta, setCustomersMeta, customerStats, fetchCustomers,
            recentServices, setRecentServices, fetchRecentServices,
            notifications, setNotifications, fetchNotifications,
            unreadCount, setUnreadCount, fetchUnreadCount,
            loading, refreshAll
        }}>
            {children}
        </DataContext.Provider>
    );
};
