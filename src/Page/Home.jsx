import React, { useState, useEffect } from 'react';
import Styles from "../Styles/Home.css";
import Loader from "../Components/Loader";
import { useLocation } from 'react-router-dom';
const Home = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [sort, setSort] = useState('asc');
    const [sortField, setSortField] = useState('name');
    const location = useLocation();

    useEffect(() => {
        setLoading(true);
        fetch(`https://randomuser.me/api/?page=${page}&results=20`)
            .then(res => res.json())
            .then(data => {
                setUsers(prevUsers => {
                    return [...new Set([...prevUsers, ...data.results.map(user => user)])]
                });
                setFilteredUsers(prevUsers => {
                    return [...new Set([...prevUsers, ...data.results.map(user => user)])]
                });
                setHasMore(data.results.length > 0);
                setLoading(false);
            })
            .catch(err => {
                setError(true);
                setLoading(false);
            });
    }, [page]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParams = params.get('search');
        if (searchParams) {
            setSearch(searchParams);
        }
    }, [location.search]);

    useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    useEffect(() => {
        setFilteredUsers(users.filter(user => {
            return user.name.first.toLowerCase().includes(search.toLowerCase()) || user.name.last.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
        }));
    }, [search]);

    useEffect(() => {
        if (sort === 'asc') {
            setFilteredUsers([...filteredUsers].sort((a, b) => a[sortField].first > b[sortField].first ? 1 : -1));
        } else {
            setFilteredUsers([...filteredUsers].sort((a, b) => a[sortField].first < b[sortField].first ? 1 : -1));
        }
    }, [sort, sortField]);

    const observer = React.useRef();
    const lastUserElementRef = React.useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        }
        );
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSort(sort === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSort('asc');
        }
    }
    const logout = () => {
        localStorage.removeItem('auth');
        window.location.href = '/';
    }

    return (
        <div className={Styles.container}>
          <h1>UserListing</h1>
          <button className={Styles.logout} onClick={logout}>Logout</button>
            <div className={Styles.search}>
                <input type="text" placeholder="Search" value={search} onChange={handleSearch} />
            </div>
            <div className={Styles.list}>
                <div className={Styles.listHeader}>
                    <button className={Styles.listHeaderItem} onClick={() => handleSort('name')}>Name</button>
                    <button className={Styles.listHeaderItem} onClick={() => handleSort('email')}>Email</button>
                    <button className={Styles.listHeaderItem} onClick={() => handleSort('phone')}>Phone</button>
                </div>
                <div className={Styles.listBody}>
                    {filteredUsers.map((user, index) => {
                        if (filteredUsers.length === index + 1) {
                            return <div className={Styles.listItem} key={user.email} ref={lastUserElementRef}>
                                <div className={Styles.listItemName}>
                                    <img src={user.picture.thumbnail} alt="user" />                                   
                                </div>
                                <div className={Styles.listItemNameText}>{user.name.first} {user.name.last}</div>
                                <div className={Styles.listItemEmail}>{user.email}</div>
                                <div className={Styles.listItemPhone}>{user.phone}</div>
                            </div>
                        } else {
                            return <div className={Styles.listItem} key={user.email}>
                                <div className={Styles.listItemName}>
                                    <img src={user.picture.thumbnail} alt="user" />                                  
                                </div>
                                <div className={Styles.listItemNameText}>Name: {user.name.first} {user.name.last}</div>
                                <div className={Styles.listItemEmail}>Email: {user.email}</div>
                                <div className={Styles.listItemPhone}>Mobile: {user.phone}</div>
                            </div>
                        }
                    }
                    )}
                </div>
            </div>
            <div className={Styles.loader}>
                {loading && <Loader />}
            </div>
            <div className={Styles.error}>
                {error && 'Error'}
            </div>
        </div>
    )
}
export default Home;