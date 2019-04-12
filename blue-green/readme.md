### URL

curl -H "Host: blue-green-app-route.default.example.com" http://${IP_ADDRESS}

### cleanup

kubectl delete -f green-app-complete-traffic.yaml
kubectl delete -f distribute-traffic.yaml
kubectl delete -f green-app-route-no-traffic.yaml
kubectl delete -f green-app-configuration.yaml
kubectl delete -f blue-app-route.yaml
kubectl delete -f blue-app-configuration.yaml
