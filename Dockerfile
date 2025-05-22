FROM scratch
COPY ./sample.wasm /sample.wasm
# RUN chmod 644 /sample.wasm
ENTRYPOINT ["/sample.wasm"]