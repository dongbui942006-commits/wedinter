import React from 'react';

const SeatMap = ({ selectedSeats = [], onSelectionChange }) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;

  const safeSelectedSeats = Array.isArray(selectedSeats) ? selectedSeats : [];

  const handleSeatClick = (seatId) => {
    let newSelectedSeats = [];

    if (safeSelectedSeats.includes(seatId)) {
      newSelectedSeats = safeSelectedSeats.filter((seat) => seat !== seatId);
    } else {
      newSelectedSeats = [...safeSelectedSeats, seatId];
    }

    console.log('SEATMAP - Ghế vừa bấm:', seatId);
    console.log('SEATMAP - Gửi danh sách ghế lên App:', newSelectedSeats);

    if (typeof onSelectionChange === 'function') {
      onSelectionChange(newSelectedSeats);
    } else {
      console.error('LỖI: App chưa truyền onSelectionChange vào SeatMap');
    }
  };

  return (
    <div className="seat-map">
      <div className="screen">MÀN HÌNH</div>

      <div className="seats">
        {rows.map((row) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>

            {Array.from({ length: seatsPerRow }, (_, index) => {
              const seatId = `${row}${index + 1}`;
              const isSelected = safeSelectedSeats.includes(seatId);

              return (
                <button
                  key={seatId}
                  type="button"
                  className={`seat ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSeatClick(seatId)}
                >
                  {seatId}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="seat-note">
        <span className="seat-demo normal"></span>
        <span>Ghế trống</span>

        <span className="seat-demo selected"></span>
        <span>Ghế đã chọn</span>
      </div>

      <div className="selected-seat-info">
        Ghế đang chọn:{' '}
        <strong>
          {safeSelectedSeats.length > 0
            ? safeSelectedSeats.join(', ')
            : 'Chưa chọn ghế'}
        </strong>
      </div>

      <style>{`
        .seat-map {
          padding: 2rem;
          border-radius: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
        }

        .screen {
          width: 80%;
          margin: 0 auto 2rem;
          padding: 0.8rem;
          text-align: center;
          border-radius: 0 0 50px 50px;
          background: linear-gradient(90deg, #facc15, #f59e0b);
          color: #000;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .seats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .seat-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .row-label {
          width: 24px;
          font-weight: 700;
          color: var(--accent-gold);
        }

        .seat {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          cursor: pointer;
          font-weight: 700;
          transition: 0.2s ease;
        }

        .seat:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
          transform: translateY(-2px);
        }

        .seat.selected {
          background: var(--accent-gold);
          color: black;
          border-color: var(--accent-gold);
        }

        .seat-note {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.7rem;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .seat-demo {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          display: inline-block;
          border: 1px solid var(--glass-border);
        }

        .seat-demo.normal {
          background: rgba(255, 255, 255, 0.08);
        }

        .seat-demo.selected {
          background: var(--accent-gold);
          border-color: var(--accent-gold);
        }

        .selected-seat-info {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          text-align: center;
        }

        .selected-seat-info strong {
          color: var(--accent-gold);
        }

        @media (max-width: 600px) {
          .seat-map {
            padding: 1rem;
            overflow-x: auto;
          }

          .seat {
            width: 34px;
            height: 34px;
            font-size: 0.75rem;
          }

          .seat-row {
            gap: 0.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SeatMap;