# Knative samples

## Knative Serve

This is a simple application written in nodejs and deployed to knative. This exposes a GET endpoint which returns a message along with the value of environment variable.

### Installation

#### Docker build and push to docker hub

```
# Build the container image (Change the docker hub user name accordingly)
docker build -t abhishekjv/helloworld-nodejs .

# Push the image to docker hub (Change the docker hub user name accordingly)
docker push abhishekjv/helloworld-nodejs
```

### Deployment to knative

#### Pre-requisite:

Knative is setup.

#### Deploy to knative

```
kubectl apply -f serving/service.yaml
```

### Execution

### Get INGRESS GATEWAY

```
# In Knative 0.2.x and prior versions, the `knative-ingressgateway` service was used instead of `istio-ingressgateway`.
   INGRESSGATEWAY=knative-ingressgateway

   # The use of `knative-ingressgateway` is deprecated in Knative v0.3.x.
   # Use `istio-ingressgateway` instead, since `knative-ingressgateway`
   # will be removed in Knative v0.4.
   if kubectl get configmap config-istio -n knative-serving &> /dev/null; then
       INGRESSGATEWAY=istio-ingressgateway
   fi

   kubectl get svc $INGRESSGATEWAY --namespace istio-system
```

#### Find IP and Host

Note: These commands are for GKE. Minikube has different commands to find the IP. (To be updated)

```
# Get the IP address
export IP_ADDRESS=$(kubectl get svc $INGRESSGATEWAY --namespace istio-system --output 'jsonpath={.status.loadBalancer.ingress[0].ip}')

# Get the Host URL
export HOST_URL=$(kubectl get route helloworld-nodejs  --output jsonpath='{.status.domain}')
```

#### Hit the endpoint

```
curl -H "Host: ${HOST_URL}" http://${IP_ADDRESS}
```

## Clean up

```
kubectl delete -f serving/service.yaml
```

## Blue Green deployment

#### Pre-requisite

Image is available in docker hub.

##### Deploy blue version of the service:

```
kubectl apply -f blue-green/blue-app.yaml
```

This will deploy blue version of the application and created a route named 'blue-green-app-route'.
This route is configured to attract 100% of the traffic. Ref the traffic settings below

```
traffic:
    - configurationName: helloworld-nodejs-blue
      percent: 100 # All traffic goes to this revision
```

Hit the URL

```
curl -H "Host: blue-green-app-route.default.example.com" http://${IP_ADDRESS}
```

#### Deploy green version of the service:

```
kubectl apply -f blue-green/green-app.yaml
```

This will deploy updated version of the application. A new revision will be created here, and the same route created for blue app will be used. Here, the route is configured to not attact any traffic at this moment. Hence, any request on the route will still be served by the blue app. Ref the traffic settings below

```
traffic:
    - configurationName: helloworld-nodejs-blue
      percent: 100 # All traffic goes to this revision
    - configurationName: helloworld-nodejs-green
      percent: 0
```

#### Distribute the traffic:

```
kubectl apply -f blue-green/distribute-traffic.yaml
```

Here, the traffic management is updated to send 50% of the traffic to blue app and 50% of traffic to green app. Hit the route and observe the traffic being split among these apps. Ref the traffic settings below

```
traffic:
    - configurationName: helloworld-nodejs-blue
      percent: 50 # All traffic goes to this revision
    - configurationName: helloworld-nodejs-green
      percent: 50
```

#### Move all traffic to green app

```
kubectl apply -f blue-green/green-app-complete-traffic.yaml
```

This will move all traffic to the updated app. Ref the traffic settings below

```
traffic:
    - configurationName: helloworld-nodejs-blue
      percent: 0 # All traffic goes to this revision
    - configurationName: helloworld-nodejs-green
      percent: 100
```

#### Clean up

```
kubectl delete -f blue-green/green-app-complete-traffic.yaml
kubectl delete -f blue-green/distribute-traffic.yaml
kubectl delete -f blue-green/green-app.yaml
kubectl delete -f blue-green/blue-app.yaml
```

## Knative build - source to url

This will take the latest code from github, build the container and then will serve it as well.
Kaniko build is used here to build the container images and push to dockerhub.

```
kubectl apply -f build/build-and-serve-docker.yaml

# Get the Host URL
export HOST_URL=$(kubectl get route knative-hw-serve-sample  --output jsonpath='{.status.domain}')
```

TO check the progress of build:

```
kubectl logs --follow --container=build-step-build-and-push <POD>
```
