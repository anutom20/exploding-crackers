"use client";
import { useState, useEffect } from "react";

const Card = ({
  cardName,
  imageSrc,
}: {
  cardName: string;
  imageSrc: string;
}) => {
  const [borderColor, setBorderColor] = useState("#21A83C");
  const getBorderColor = (cardName: string) => {
    switch (cardName) {
      case "attack":
        return "#FFBD59";
      case "defuse":
        return "#BDEA46";
      case "explosion":
        return "#FFBD4A";
      case "skip":
        return "#5371FF";
      case "reverse":
        return "#3DAAC4";
      case "shuffle":
        return "#F1E4CA";
      case "favor":
        return "#21A83C";
      case "future":
        return "#FF66C4";
      default:
        return "#21A83C";
    }
  };

  useEffect(() => {
    setBorderColor(getBorderColor(cardName));
  }, [cardName]);

  return (
    <div
      className={`border-4 h-full bg-white rounded-2xl shadow-lg flex flex-col flex-shrink-0 items-center w-inherit`}
      style={{
        borderColor: borderColor,
        backgroundColor: cardName === "explosion" ? "#FFBD4A" : "white",
      }}
    >
      <div className="p-2">
        <img
          src={imageSrc}
          alt={cardName}
          className="rounded-lg object-contain"
        />
      </div>
    </div>
  );
};

export default Card;
