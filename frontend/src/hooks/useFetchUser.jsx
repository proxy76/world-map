import { useState, useEffect } from "react";
import { USER_INFO_ENDPOINT_URL } from '../utils/ApiHost.JS';
const useFetchUser = () => {
  const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(USER_INFO_ENDPOINT_URL, {
            credentials: 'include'
        })
        .then((res) => res.json())
        .then((data) => {
            setUser(data);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching user info:', error);
            setLoading(false);
        });
    }, []);
    return { user, loading };
};
export default useFetchUser;
