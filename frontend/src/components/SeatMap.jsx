import React, { useState } from 'react';

const SeatMap = ({ onSelectionChange }) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showEmptySeats, setShowEmptySeats] = useState(false);
  const [showOccupiedSeats, setShowOccupiedSeats] = useState(false);

  // Ghế đã có người đặt
  const occupied = ['B3', 'B4', 'D1', 'D2', 'F5'];

  const emptySeatsList = [];
  rows.forEach((row) => {
    cols.forEach((col) => {
      const seatId = `${row}${col}`;
      if (!occupied.includes(seatId) && !selectedSeats.includes(seatId)) {
        emptySeatsList.push(seatId);
      }
    });
  });


  const toggleSeat = (seatId) => {
    if (occupied.includes(seatId)) return;

    let newSelection;

    if (selectedSeats.includes(seatId)) {
      newSelection = selectedSeats.filter((seat) => seat !== seatId);
    } else {
      newSelection = [...selectedSeats, seatId];
    }

    setSelectedSeats(newSelection);
    onSelectionChange(newSelection);
  };

  return (
    <div className="seat-booking">
      <div className="screen-container">
        <div className="screen"></div>
        <p>MÀN HÌNH</p>
      </div>

      <div className="seats-grid">
        {rows.map((row) => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>

            {cols.map((col) => {
              const seatId = `${row}${col}`;
              const isOccupied = occupied.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);

              return (
                <div
                  key={seatId}
                  className={`seat ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''
                    }`}
                  onClick={() => toggleSeat(seatId)}
                  title={
                    isOccupied
                      ? 'Ghế đã được đặt'
                      : isSelected
                        ? 'Bấm để bỏ chọn ghế'
                        : 'Bấm để chọn ghế'
                  }
                >
                  {col}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="legend">
        <div className="legend-item" onClick={() => setShowEmptySeats(!showEmptySeats)} style={{ cursor: 'pointer' }} title="Bấm để xem danh sách">
          <div className="seat"></div>
          Ghế trống
        </div>

        <div className="legend-item">
          <div className="seat selected"></div>
          Ghế đang chọn
        </div>

        <div className="legend-item" onClick={() => setShowOccupiedSeats(!showOccupiedSeats)} style={{ cursor: 'pointer' }} title="Bấm để xem danh sách">
          <div className="seat occupied"></div>
          Ghế đã đặt
        </div>
      </div>

      <div className="selected-info">
        <div style={{ marginBottom: '0.5rem' }}>
          Số ghế còn trống: <strong>{emptySeatsList.length}</strong>
        </div>

        {showEmptySeats && emptySeatsList.length > 0 && (
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            Danh sách ghế trống: <strong>{emptySeatsList.join(', ')}</strong>
          </div>
        )}

        {showOccupiedSeats && occupied.length > 0 && (
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ff6b6b' }}>
            Danh sách ghế đã đặt: <strong>{occupied.join(', ')}</strong>
          </div>
        )}

        {selectedSeats.length > 0 && (
          <div>
            Ghế bạn đã chọn: <strong>{selectedSeats.join(', ')}</strong>
          </div>
        )}
      </div>

      <style>{`
        .seat-booking {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          background: var(--bg-secondary);
          border-radius: 20px;
        }

        .screen-container {
          width: 100%;
          margin-bottom: 3rem;
          text-align: center;
        }

        .screen-container p {
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 2px;
        }

        .screen {
          height: 10px;
          background: var(--accent-gold);
          width: 80%;
          margin: 0 auto 10px;
          border-radius: 50%;
          box-shadow: 0 10px 20px rgba(255, 193, 7, 0.4);
        }

        .seats-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .seat-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .row-label {
          width: 20px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .seat {
          width: 35px;
          height: 35px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          cursor: pointer;
          transition: var(--transition);
          user-select: none;
        }

        .seat:hover:not(.occupied) {
          border-color: var(--accent-gold);
          transform: scale(1.1);
        }

        .seat.selected {
          background: var(--accent-gold);
          color: black;
          border-color: var(--accent-gold);
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
        }

        .seat.occupied {
          background: #333;
          border-color: #444;
          color: #555;
          cursor: not-allowed;
        }

        .legend {
          display: flex;
          gap: 2rem;
          margin-top: 3rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .legend-item .seat {
          width: 20px;
          height: 20px;
          cursor: default;
        }

        .legend-item .seat:hover {
          transform: none;
        }

        .selected-info {
          margin-top: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
        }

        .selected-info strong {
          color: var(--accent-gold);
        }

        @media (max-width: 600px) {
          .seat-booking {
            padding: 1rem;
          }

          .seat {
            width: 30px;
            height: 30px;
            font-size: 0.75rem;
          }

          .seat-row {
            gap: 6px;
          }

          .legend {
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SeatMap;