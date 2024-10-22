import React, { useEffect, useState } from "react";

function parseContent(content) {
  // Check if content is a string
  if (typeof content !== "string") {
    return ""; // Return an empty string or a default message if content is not valid
  }

  // Replace '**' with '<strong>' and '</strong>'
  const boldedContent = content.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // Replace newline characters with <br>
  const formattedContent = boldedContent.replace(/\n/g, "<br>");

  // Replace bullet point marker with an actual bullet point
  const finalContent = formattedContent
    .replace(/<br>\s*\*(.*?)<br>/g, "<br>&bull; $1<br>")
    .replace(/<br>\s*\*(.*?)(?=<br>|$)/g, "<br>&bull; $1"); // Handle last item without a following <br>

  return finalContent;
}

const TypewriterEffect = ({ text, speed = 100, repeat = false }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    // Function to type one letter
    const typeLetter = () => {
      if (currentIndex < text?.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      } else if (repeat) {
        // Reset for repeat
        setDisplayedText(""); // Clear displayed text
        setCurrentIndex(0); // Reset index
      }
    };
    setInterval(() => {
      console.log("Interval");
    }, 3000);
    const timeoutId = setTimeout(typeLetter, speed);

    return () => clearTimeout(timeoutId); // Clean up the timeout
  }, [currentIndex, text, speed, repeat]);

  return (
    <div dangerouslySetInnerHTML={{ __html: parseContent(displayedText) }} />
  );
};

export default TypewriterEffect;
