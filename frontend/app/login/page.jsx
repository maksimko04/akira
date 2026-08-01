"use client"

import Header from "@/app/components/Header"
import "./styles.css"
import UserApi from "../services/UserApi";
import { useRef } from "react";
import { emailRegex, passwordRegex } from "../constants/regexes";
import responseStatuses from "../constants/responseStatuses";

export default () => {
    const emailRef = useRef(null)
    const passwordRef = useRef(null)

    const switchFieldCorrectness = (ref, regex) => {
        if (!regex.test(ref.current.value.trim())) {
            ref.current.focus();
            ref.current.parentElement.classList.add("invalid");
            return 1;
        }

        ref.current.parentElement.classList.remove("invalid");
        return 0;

    }

    const onSubmit = async (event) => {
        event.preventDefault();

        let countErrors = 0;

        countErrors += switchFieldCorrectness(emailRef, emailRegex);
        countErrors += switchFieldCorrectness(passwordRef, passwordRegex);

        if (countErrors > 0) {
            return;
        }

        const response = await UserApi.login(
            emailRef.current.value.trim(),
            passwordRef.current.value.trim());
        
        if(response.data.status === responseStatuses.success){
            window.location.replace("/");
        }
    }

    return (<>
        <Header />
        <main className="container">
            <h2>Sign in</h2>
            <form onSubmit={onSubmit}>
                <div>
                    <input type="email" placeholder="Email..." ref={emailRef} />
                </div>
                <div>
                    <input type="password" placeholder="Password..." ref={passwordRef} />
                </div>
                <button type="submit" className="primary-button">Sign in</button>
            </form>
        </main>
    </>);
}