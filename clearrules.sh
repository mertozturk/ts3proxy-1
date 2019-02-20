oldrules=$(iptables --line-number -nL PREROUTING -t nat | grep "ts3proxy" | awk '{print $1}' | tac)
for rul in $oldrules; do iptables -t nat -D PREROUTING $rul; done

echo "" > usedports.txt
