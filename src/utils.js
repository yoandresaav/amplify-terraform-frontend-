

function slugify(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    // .replace(/[^\w\-]+/g, '')       // Remove all non-word chars, this remove also "."
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}


  export const divideInChunks = (file, sliderValue) => {
    const allChunks = [];
    var chunkSize = sliderValue * 1024;
    // var fileSize = file.size;
    var chunks = Math.ceil(file.size / chunkSize, chunkSize);
    var chunk = 0;

    while (chunk <= chunks) {
      var offset = chunk * chunkSize;
      const blob = file.slice(offset, offset + chunkSize);

      const slugFileName = slugify(file.name);
      const fileName = `${slugFileName}._part_.${chunk}`;
      const newFile = new File([blob], fileName, {
        type: file.type,
        lastModified: file.lastModified,
      });
      if (blob.size === 0) {
        break;
      }
      allChunks.push(newFile);
      chunk++;
    }

    return allChunks;
  };

