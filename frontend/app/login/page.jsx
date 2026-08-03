"use client"

import Header from "@/components/Header"
import styles from "./styles.module.scss"
import UserApi from "@/api/UserApi";
import { useRef } from "react";
import { emailRegex, passwordRegex } from "@/constants/regexes";
import responseStatuses from "@/constants/responseStatuses";
import { useToast } from "@/providers/toastProvider"
import typesToast from "@/constants/typesToast";
import { useAuthStore } from "../../store/useAuthStore";
import { useRouter } from "next/navigation";

export default () => {
    const emailRef = useRef(null)
    const passwordRef = useRef(null)

    const createToast = useToast();

    const router = useRouter();

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

        if (countErrors > 0) {
            return;
        }

        try {
            const response = await UserApi.login({
                email: emailRef.current.value.trim(),
                password: passwordRef.current.value.trim()
            });

            setUser(response.data.user._id);
            router.replace("/")
        }
        catch (err) {
            createToast(typesToast.error, "Incorrect email or password");
        }

    }

    return (<>
        <Header />
        <main className={styles.container}>
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