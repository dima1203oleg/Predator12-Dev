import time
import threading
from websocket import create_connection, WebSocketException

# Configuration
API_WS_URL = "ws://localhost:8000/ws/sentiment-updates"
NUM_CLIENTS = 100  # Number of simultaneous clients to simulate
DURATION_SECONDS = 60  # How long to run the test

# Counter for received messages
total_messages_received = 0
lock = threading.Lock()

def client_simulation(client_id):
    global total_messages_received
    try:
        print(f"Client {client_id} connecting...")
        ws = create_connection(API_WS_URL)
        print(f"Client {client_id} connected.")
        start_time = time.time()
        messages_received = 0

        while time.time() - start_time < DURATION_SECONDS:
            try:
                ws.recv()
                messages_received += 1
                with lock:
                    total_messages_received += 1
                if messages_received % 10 == 0:  # Print every 10 messages
                    print(f"Client {client_id} received "
                          f"{messages_received} messages.")
            except WebSocketException as e:
                print(f"Client {client_id} error: {e}")
                break

        print(f"Client {client_id} disconnecting after "
              f"{messages_received} messages.")
        ws.close()
    except Exception as e:
        print(f"Client {client_id} failed: {e}")

def run_stress_test():
    threads = []
    start_time = time.time()

    # Start all client threads
    for i in range(NUM_CLIENTS):
        thread = threading.Thread(target=client_simulation, args=(i,))
        thread.daemon = True
        thread.start()
        threads.append(thread)

    # Wait for test duration or until all threads complete
    for thread in threads:
        thread.join(timeout=DURATION_SECONDS - (time.time() - start_time))

    end_time = time.time()
    print(f"\nStress Test Completed.\nDuration: "
          f"{end_time - start_time:.2f} seconds")
    print(f"Total Messages Received: {total_messages_received}")
    print(f"Average Messages per Second: "
          f"{total_messages_received / (end_time - start_time):.2f}")
    print(f"Average Messages per Client: "
          f"{total_messages_received / NUM_CLIENTS:.2f}")

if __name__ == "__main__":
    print(f"Starting WebSocket stress test with {NUM_CLIENTS} clients "
          f"for {DURATION_SECONDS} seconds...")
    run_stress_test() 