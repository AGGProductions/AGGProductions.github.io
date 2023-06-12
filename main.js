document.addEventListener('DOMContentLoaded', function () 
{
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const gameCards = document.querySelector('.game-cards');
    const gameCardWidth = document.querySelector('.game-card').offsetWidth;
    let translateX = 0;
  
    prevBtn.addEventListener('click', function () 
    {
      if (translateX < 0) 
      {
        translateX += gameCardWidth + 40; // Adjusted margin value
        gameCards.style.transform = `translateX(${translateX}px)`;
      }
    });
  
    nextBtn.addEventListener('click', function () 
    {
      const containerWidth = gameCards.offsetWidth;
      const cardsWidth = gameCards.scrollWidth;
      if (Math.abs(translateX) < cardsWidth - containerWidth) 
      {
        translateX -= gameCardWidth + 40; // Adjusted margin value
        gameCards.style.transform = `translateX(${translateX}px)`;
      }
    });
});