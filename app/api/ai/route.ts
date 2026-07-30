import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request){
 try{
  if(!process.env.OPENAI_API_KEY) return NextResponse.json({error:"Chưa cấu hình OPENAI_API_KEY."},{status:500});
  const body=await req.json();
  const info=body.info||{};
  let task="";
  if(body.mode==="review") task=`Phân tích kịch bản, chấm Hook, Logic, Twist, Cảm xúc, Nhịp kể, Giữ chân. Chỉ ra lỗi cụ thể và cách sửa.

${body.input||""}`;
  else if(body.mode==="rewrite") task=`Viết lại kịch bản sau thành bản hoàn chỉnh, tự nhiên, logic, giữ ý chính, sửa đoạn ghép máy móc và twist vô lý.

${body.input||""}`;
  else if(body.mode==="hooks") task=`Viết 20 hook khác nhau cho chủ đề sau. Mỗi hook rõ nhân vật, bối cảnh, sự cố. Chỉ đánh số.

${JSON.stringify(info)}`;
  else task=`Viết kịch bản TikTok Voice Over hoàn chỉnh theo Hook → Mâu thuẫn → Diễn biến → Cao trào → Twist → Kết.
${JSON.stringify(info)}`;
  const response=await client.responses.create({
   model:process.env.OPENAI_MODEL||"gpt-5-mini",
   instructions:body.style||"Bạn là biên tập viên TikTok cho Siêu Di Động. Viết tự nhiên, logic, không quảng cáo lộ liễu.",
   input:task
  });
  return NextResponse.json({text:response.output_text});
 }catch(e:any){
  return NextResponse.json({error:e?.message||"Lỗi AI."},{status:500});
 }
}
