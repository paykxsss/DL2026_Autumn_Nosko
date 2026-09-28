import io
import base64
from typing import Optional, List
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import qrcode
from qrcode.image.svg import SvgPathImage

app = FastAPI(title="QR Code Generator API")

# Разрешаем запросы с любого порта фронтенда (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модель входящего запроса
class QRRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="Текст или URL")
    fg_color: str = Field("#000000", description="Цвет кода (HEX)")
    bg_color: str = Field("#FFFFFF", description="Цвет фона (HEX)")
    format: str = Field("png", description="Формат: png или svg")
    box_size: int = Field(10, ge=4, le=30, description="Размер точек")

# Локальное хранилище истории в памяти (последние 10 кодов)
history_db: List[dict] = []

@app.post("/api/qr/generate")
def generate_qr(req: QRRequest):
    """
    Генерирует QR-код в формате Base64 (PNG или SVG),
    чтобы фронтенд мог сразу отобразить его и дать скачать.
    """
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Содержимое QR-кода не может быть пустым.")

    try:
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=req.box_size,
            border=2,
        )
        qr.add_data(req.content)
        qr.make(fit=True)

        if req.format.lower() == "svg":
            img = qr.make_image(image_factory=SvgPathImage)
            buffer = io.BytesIO()
            img.save(buffer)
            svg_str = buffer.getvalue().decode("utf-8")
            data_url = f"data:image/svg+xml;utf8,{svg_str}"
        else:
            # PNG по умолчанию
            img = qr.make_image(fill_color=req.fg_color, back_color=req.bg_color)
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
            data_url = f"data:image/png;base64,{b64_str}"

        item = {
            "id": len(history_db) + 1,
            "content": req.content,
            "fg_color": req.fg_color,
            "bg_color": req.bg_color,
            "format": req.format,
            "image": data_url,
            "created_at": datetime.now().strftime("%H:%M:%S")
        }

        # Добавляем в начало истории (храним последние 10)
        history_db.insert(0, item)
        if len(history_db) > 10:
            history_db.pop()

        return {
            "status": "success",
            "data": item
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка генерации QR-кода: {str(e)}")

@app.get("/api/qr/history")
def get_history():
    """Возвращает историю сгенерированных QR-кодов."""
    return {"status": "success", "data": history_db}