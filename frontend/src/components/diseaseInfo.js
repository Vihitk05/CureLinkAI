import React from "react";

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

const DiseasePredictionInfo = ({ content }) => { // Destructure content from props
  return (
    <div py="10">
      <div dangerouslySetInnerHTML={{ __html: parseContent(content) }} />
    </div>
  );
};

export default DiseasePredictionInfo;
