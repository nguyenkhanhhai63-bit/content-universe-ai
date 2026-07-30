"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
export default function Login(){
 const [email,setEmail]=useState("");const [msg,setMsg]=useState("");
 async function login(){const s=createClient();if(!s)return setMsg("Chưa cấu hình Supabase.");const {error}=await s.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin}});setMsg(error?.message||"Đã gửi link đăng nhập vào email.");}
 return <main style={{maxWidth:440,margin:"80px auto",padding:20}}><div className="panel"><h1>Đăng nhập Content Universe</h1><div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)}/></div><button className="btn primary" onClick={login}>Gửi link đăng nhập</button><p>{msg}</p></div></main>
}
