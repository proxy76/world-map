import {useEffect, useState} from "react";
import {LOGIN_ENDPOINT_URL} from "../utils/ApiHost";
import axios from 'axios';
const useLogin = ({username, password}) => {
    useEffect(() => {
        axios.post(LOGIN_ENDPOINT_URL, {
            username: username,
            password: password
          })
          .then((response) => {
            console.log(response.status);
            console.log('sal'); 
            localStorage.setItem('isLogged', 1);
          })
          .catch((error) => {
            console.log(error);
            localStorage.setItem('isLogged', 0);
          });
    }, []);
}
export default useLogin;
