'use client'; // Important if you're using Server Components

import { useEffect, useState } from 'react';
import api from '@/lib/api'; // Adjust the import if your API file is in a different folder
import Loading from './loading';

type Seat = {
    seat_number: number;
    status: string;
};

const SeatBooking = () => {
  const [seats, setSeats] = useState<{ seat_number: number; status: string }[]>([]);
  const [loading, setLoading] = useState(true); // ← Track loading state for intial page mount
  const [seatInput, setSeatInput] = useState('0'); // track the input number of seat
  const [isBooking, setIsBooking] = useState(false); // track if booking is in progress or not.
  const [isResetting, setIsResetting] = useState(false);  // track if resetting seat is in progress or not
  const [bookedSeats, setBookedSeats] = useState<number[]>([]); // track the booked seat number
  const [showToast, setShowToast] = useState(false); // track if show booking successfull message
  const [showToast1, setShowToast1] = useState(false); // track if show resetting successfull message

  const handleToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000); // hide after 2s
  };

  const handleToast1 = () => {
    setShowToast1(true);
    setTimeout(() => setShowToast1(false), 2000); // hide after 2s
  };

  const fetchSeats = async () => {
    console.log('Fetching data');
    try {
      const response = await api.get('/seat');
      console.log('Fetched seats:', response.data);
  
      const seatArray = response.data.seats;

      seatArray.sort((a:Seat, b:Seat)=>a.seat_number-b.seat_number );
  
      console.log(seatArray);
      
      setSeats(seatArray); // Or just response.data depending on your backend
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  // fetch all seats first time
  useEffect(() => {
    const fetchingSeats = async () => {
      await fetchSeats();
      setLoading(false);
    };
    fetchingSeats();
  }, []);

  // booking logic
  const handleBooking = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('Booking started..');

    setBookedSeats([]);

    setIsBooking(true);

    // Parse input to get the number of seats
    const numSeats = parseInt(seatInput);

    // Check if input is valid
    if (isNaN(numSeats) || numSeats <= 0) {
      alert('Please enter a valid number of seats.');
      return;
    }

    // Generate ticketArray based on user input (the first `numSeats` available seats)
    console.log('generating available seats array');

    // array of available seat number
    const availableSeats = seats.filter(seat => seat.status === 'available');
    const ROWS = 12;
    const COLS = 7;
    const TOTAL_CELLS = 80;
    const K = numSeats; // number of seat required to book

    const grid1 = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); // intialize the matrix

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const cellNumber = i * COLS + j + 1;

        const isAvailable = availableSeats.find(({seat_number}) => seat_number === cellNumber); // if cellNumber matches with seatNumber means it is available

        if(!isAvailable){
          // not available then marked it as blocked cell
          grid1[i][j] = 2;
        }
      }
    }

    console.log('Initialize matrix to blocked the filled seat');

    let minSpreadx = Infinity;
    let minSpready = Infinity;
    let res = grid1.map(row => row.slice());

    let answerFound = false;

    // taking minimum combined spread of all possible options

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
          if (grid1[i][j] === 0) {
              // if cell is not blocked

              const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

              for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                  const cellNumber = i * COLS + j + 1;
          
                  const isAvailable = availableSeats.find(({seat_number}) => seat_number === cellNumber); // if cellNumber matches with cellNumber means it is available
          
                  if(!isAvailable){
                    // not available then marked it as blocked cell
                    grid[i][j] = 2;
                  }
                }
              }
              const visited: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  
              const q: [number, number][] = [];
              let cnt = 0;
  
              q.push([i, j]);
              visited[i][j] = true;
              grid[i][j] = 1;
  
              let maxx = j;
              let minx = j;
              let miny = i;
              let maxy = i;

              // use of bfs to fill the next seat which is not blocked and which is nearest to the current seat

              while (q.length > 0) {
                const [x, y]: [number, number] = q.shift()!;

                  cnt++;
                  // break the loop if we filled the K seats
                  if (cnt === K) break;

                  let cellFilled = false;
  
                  for (let row = x; row < ROWS; row++) {
                      for (let col = 0; col < COLS; col++) {
                          const nextCellNumber = row * COLS + col + 1;

                          // use of bfs to fill the next seat which is not blocked and which is nearest to the current seat
                          if (nextCellNumber <= TOTAL_CELLS && !visited[row][col] && grid[row][col] !== 2) {
                              visited[row][col] = true;
                              grid[row][col] = 1;
  
                              maxx = Math.max(maxx, col);
                              minx = Math.min(minx, col);
                              maxy = Math.max(maxy, row);
                              miny = Math.min(miny, row);
  
                              q.push([row, col]);
                              cellFilled = true;
                              break;
                          }
                      }
                      if (cellFilled) break;
                  }
              }
  
              if (cnt !== K) continue;
  
              const currSpreadx = maxx - minx;
              const currSpready = maxy - miny;

              // taking that possibe seating arrangement which has minimum y spread and minimum x spread
  
              if (currSpready < minSpready || (currSpready === minSpready && currSpreadx < minSpreadx)) {
                answerFound = true;

                // return the optimal seating arrangement
                res = grid.map(row => row.slice());

                minSpreadx = currSpreadx;
                minSpready = currSpready;
              }
          }
      }
    }

    console.log('found the best arrangement');

    const bookedSeatsarr: number[] = [];

    if(answerFound){
      // taking all the booked seat number
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if(res[i][j] === 1){
            const cellNumber = i * COLS + j + 1;

            bookedSeatsarr.push(cellNumber);
          }
        }
      }
    }

    console.log('got the bookedSeats', bookedSeatsarr);

    try {
      // Send POST request to book the selected seats
      console.log('calling api..');
      await api.post('/seat', {bookedSeats: bookedSeatsarr });

      console.log('booking successful');

    } catch (error) {
      console.error('Error booking seats:', error);
    }

    console.log('fetching the updated seats');

    //getting the updated seats
    await fetchSeats();
    
    // booking finish
    setIsBooking(false);

    //show success message
    handleToast();

    //show booked seat number
    setBookedSeats(bookedSeatsarr);
  };

  const resetBooking = async () => {
    try {
      setIsResetting(true);
      setBookedSeats([]);

      // Call your DELETE API to reset seat booking
      await api.delete('/seat'); // Ensure your API endpoint is correctly defined in your backend
      console.log('Booking reset successfully');

    } catch (error) {
      console.error('Error resetting booking:', error);
      
    }

    // fetch all the updated seats
    await fetchSeats();
    
    setIsResetting(false);
    handleToast1();
  };

  // count the number of booked and available seat
  const bookedCount = seats.filter(seat => seat.status === 'booked').length;
  const availableCount = seats.filter(seat => seat.status === 'available').length;

  if (loading) {
    return (
      <Loading/>
    );
  }
  return (
    <>
    {(showToast || showToast1) && (
        <div
          id="toast-success"
          className="fixed left-1/2 top-4 transform -translate-x-1/2 flex items-center justify-center w-60 max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 z-50"
          role="alert"
        >
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
          <div className="ms-3 text-sm font-normal">
            {showToast ? 'Booking successful': 'Seat resetted'}
          </div>
        </div>
      )}
    <div className='flex justify-between max-[1024px]:block'>
      <div className='max-[1024px]:flex max-[1024px]:justify-center'> 
      <div className='w-120 max-[480px]:w-87'>
        <h2 className="text-xl dark:text-white flex justify-center font-semibold mb-4">Ticket Seat</h2>
        <div className="grid grid-cols-7 gap-x-1 gap-y-4">
            {seats.map((seat) => (
              <div
                key={seat.seat_number}
                className={`rounded-xl flex items-center justify-center h-9 w-full font-bold text-lg shadow-sm transition
                  ${seat.status === 'booked' ? 'bg-yellow-400 dark:bg-yellow-600' : 'bg-lime-400 dark:bg-lime-600'}
                  hover:bg-opacity-80
                `}
              >
                {seat.seat_number}
              </div>
            ))}
        </div>
        <div className='flex justify-between px-2 py-3 h-16'>
          <div className='bg-yellow-400 dark:bg-yellow-600 rounded-xl text-l max-[480px]:text-sm font-bold flex justify-center items-center w-54 max-[480px]:w-40'>Booked Seats = {bookedCount}</div>
          <div className='bg-lime-400 dark:bg-lime-600 rounded-xl text-l max-[480px]:text-sm font-bold flex justify-center items-center w-54 max-[480px]:w-40'>Available Seats = {availableCount}</div>
        </div>
      </div>
      </div>
      <div className='w-full flex justify-center items-center max-[1024px]:mt-30 min-[1024px]:justify-end min-[1024px]:mr-10'>
        <div className=''>
          <div className='flex'>
            <div className='h-10 w-30 p-2 font-bold mb-2 dark:text-white'>Book Seats</div>
            <div className='grid grid-cols-7  h-10 w-60 min-[1024px]:w-85'>
              {bookedSeats.length !== 0 && bookedSeats.map((seat, idx) => (
                <div
                  key={idx}
                  className={`w-10 max-[1024px]:text-sm max-[1024px]:w-8 ml-1 rounded-xl flex items-center justify-center h-9 font-bold text-lg shadow-sm transition bg-lime-400 dark:bg-lime-600 hover:bg-opacity-80`}
                >
                  {seat}
                </div>
              ))}
            </div>
          </div>
          <form className="flex space-y-4 " onSubmit={handleBooking}>
            <input
              type="number"
              placeholder="Enter number of seat"
              value={seatInput}
              onChange={(e) => setSeatInput(e.target.value)} // Update input value
              className="placeholder:text-sm border w-70 max-[480px]:w-40 mr-3 h-8 bg-gray-50 border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
      
            <button
              disabled={!seatInput || seatInput === '0' || parseInt(seatInput)<0 || parseInt(seatInput) > 7 || parseInt(seatInput)> availableCount || isBooking}
              type="submit"
              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 text-[12px] w-full h-8 text-white bg-blue-600 cursor-pointer hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <div className=" flex justify-center items-center">
                {isBooking ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
                  'Book seat'
                )}
            </div>
            </button>
          </form>
          <button
            onClick={resetBooking}
            disabled={isResetting}
            className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 text-[12px] w-full h-8 text-white bg-blue-600 cursor-pointer hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
          >
            <div className=" flex justify-center items-center">
              {isResetting ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                'Reset booking'
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default SeatBooking;