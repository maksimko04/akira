"use client"

import Header from "@/components/Header"
import UserApi from "@/api/UserApi";
import { useRef } from "react";
import responseStatuses from "@/constants/responseStatuses";
import { useToast } from "@/providers/toastProvider"
import typesToast from "@/constants/typesToast";
import { usernameRegex, emailRegex, nameRegex, passwordRegex } from "@/constants/regexes";
import serverResponses from "../../constants/serverResponses";
import {useRouter} from "next/navigation" 

import styles from "./styles.module.scss"

export default () => {
    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const usernameRef = useRef(null);
    const nameRef = useRef(null);
    const router = useRouter();

    const createToast = useToast();

    const switchFieldCorrectness = (ref, regex) => {
        if (!regex.test(ref.current.value.trim())) {
            ref.current.focus();
            ref.current.parentElement.classList.add("invalid");
            return 1;
        }

        ref.current.parentElement.classList.remove("invalid");
        return 0;

    }

    const setUser = useAuthStore(state => state.setUser);

    const onSubmit = async (event) => {
        event.preventDefault();

        let countErrors = 0;

        countErrors += switchFieldCorrectness(emailRef, emailRegex);
        countErrors += switchFieldCorrectness(passwordRef, passwordRegex);
        countErrors += switchFieldCorrectness(usernameRef, usernameRegex);
        countErrors += switchFieldCorrectness(nameRef, nameRegex);

        if (countErrors > 0) {
            return;
        }

        try {
            const response = await UserApi.registration({
                email: emailRef.current.value.trim(),
                password: passwordRef.current.value.trim(),
                username: usernameRef.current.value.trim(),
                name: nameRef.current.value.trim()
            });

            setUser(response.data.user._id);
            router.replace("/");
        }
        catch (err) {
            const message = serverResponses[err.response.data.err] ?? "something went wrong";
            createToast(typesToast.error, message);
        }

    }

    return (<>
        <Header />
        <main className={styles.container}>
            <h2>Sign up</h2>
            <form onSubmit={onSubmit}>
                <div>
                    <input type="text" placeholder="Username..." ref={usernameRef} />
                </div>
                <div>
                    <input type="email" placeholder="Email..." ref={emailRef} />
                </div>
                <div>
                    <input type="text" placeholder="Name..." ref={nameRef} />
                </div>
                <div>
                    <input type="password" placeholder="Password..." ref={passwordRef} />
                </div>
                <button type="submit" className="primary-button">Sign up</button>
            </form>
        </main>
    </>);
}